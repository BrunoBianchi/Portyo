import { AppDataSource } from "../../database/datasource";
import { MarketingProposalEntity } from "../../database/entity/marketing-proposal-entity";
import { MarketingSlotEntity } from "../../database/entity/marketing-slot-entity";
import { MailService } from "./mail.service";
import { ApiError, APIErrors } from "../errors/api-error";
import * as jwt from "jsonwebtoken";
import { env } from "../../config/env";
import * as StripeService from "./stripe.service";

const ProposalRepository = AppDataSource.getRepository(MarketingProposalEntity);
const SlotRepository = AppDataSource.getRepository(MarketingSlotEntity);

export async function sendAccessCode(proposalId: string) {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId },
        relations: ['company', 'slot']
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 min expiry

    proposal.accessCode = code;
    proposal.accessCodeExpiresAt = expiresAt;
    await ProposalRepository.save(proposal);

    const email = proposal.guestEmail || proposal.company?.email;
    if (email) {
        await MailService.sendAccessCodeEmail(email, code, proposal.slot.slotName);
    }
}

export async function verifyAccessCode(proposalId: string, code: string) {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId }
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }

    if (proposal.accessCode !== code) {
        throw new ApiError(APIErrors.validationError, "Invalid code", 400);
    }

    if (!proposal.accessCodeExpiresAt || new Date() > proposal.accessCodeExpiresAt) {
        throw new ApiError(APIErrors.validationError, "Code expired", 400);
    }

    // Generate temporary access token
    const token = jwt.sign(
        { proposalId: proposal.id, type: 'proposal_access' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Clear code after success (optional, or keep for session duration)
    // proposal.accessCode = null;
    // await ProposalRepository.save(proposal);

    return { token, proposal };
}

export async function getProposal(proposalId: string) {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId },
        relations: ['company', 'slot']
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }
    
    return proposal;
}

export async function validateProposalPayment(proposalId: string) {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId },
        relations: ['slot', 'slot.bio', 'slot.bio.integrations']
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }

    const stripeIntegration = proposal.slot?.bio?.integrations?.find(
        i => i.name === 'stripe' && i.account_id
    );

    if (!stripeIntegration?.account_id) {
        throw new ApiError(APIErrors.validationError, "Stripe account not connected for this proposal", 400);
    }

    const stripeCheck = await StripeService.verifyMarketingProposalPayment(
        proposalId,
        stripeIntegration.account_id
    );

    if (!stripeCheck.found) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found in Stripe", 404);
    }

    if (!stripeCheck.paid) {
        throw new ApiError(APIErrors.validationError, "Payment not completed", 400);
    }

    return { valid: true, paid: true, stripe: stripeCheck };
}

export async function updateProposalCreative(proposalId: string, content: any) {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId },
        relations: ['slot']
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }

    // Allow updating content columns
    proposal.content = {
        ...proposal.content,
        ...content
    };

    proposal.status = 'in_progress';

    if (proposal.slot) {
        if (!proposal.slot.activeProposalId || proposal.slot.activeProposalId === proposal.id) {
            proposal.slot.activeProposalId = proposal.id;
        }
        proposal.slot.status = 'pending_approval';
        await SlotRepository.save(proposal.slot);
    }
    
    // Explicitly update image url if passed at top level or deep merge
    // Assumption: content passed is the partial content object
    
    return await ProposalRepository.save(proposal);
}

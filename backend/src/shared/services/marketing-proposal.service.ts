import { AppDataSource } from "../../database/datasource";
import { MarketingProposalEntity } from "../../database/entity/marketing-proposal-entity";
import { MarketingSlotEntity } from "../../database/entity/marketing-slot-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import { In } from "typeorm";

const ProposalRepository = AppDataSource.getRepository(MarketingProposalEntity);
const SlotRepository = AppDataSource.getRepository(MarketingSlotEntity);

export interface CreateProposalData {
    slotId: string;
    proposedPrice: number;
    message?: string;
    guestName?: string;
    guestEmail?: string;
    content: {
        title: string;
        description: string;
        imageUrl?: string;
        linkUrl: string;
        buttonText?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
        buttonTextColor?: string;
        layout?: 'card' | 'banner' | 'compact' | 'featured';
        sponsorLabel?: string;
    };
}

// Create proposal
export async function createProposal(companyId: string | null, data: CreateProposalData): Promise<MarketingProposalEntity> {
    // Check if slot exists and is available
    const slot = await SlotRepository.findOne({ where: { id: data.slotId } });
    
    if (!slot) {
        throw new ApiError(APIErrors.notFoundError, "Slot not found", 404);
    }

    if (slot.status !== 'available') {
        throw new ApiError(APIErrors.forbiddenError, "Slot is not available", 403);
    }

    // Validate price
    if (!slot.acceptOtherPrices) {
        if (data.proposedPrice < slot.priceMin || data.proposedPrice > slot.priceMax) {
            throw new ApiError(
                APIErrors.validationError,
                `Price must be between ${slot.priceMin} and ${slot.priceMax}`,
                400
            );
        }
    }

    // Validate content
    if (!data.content.title || !data.content.linkUrl) {
        throw new ApiError(
            APIErrors.validationError,
            "Title and link URL are required",
            400
        );
    }

    if (!companyId && (!data.guestName || !data.guestEmail)) {
        throw new ApiError(
            APIErrors.validationError,
            "Name and email are required for guest proposals",
            400
        );
    }

    const proposal = ProposalRepository.create({
        slotId: data.slotId,
        companyId: companyId || undefined,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        proposedPrice: data.proposedPrice,
        message: data.message,
        content: data.content,
        status: 'pending',
        impressions: 0,
        clicks: 0
    });

    const saved = await ProposalRepository.save(proposal);

    // Increment total proposals on slot
    await SlotRepository.increment({ id: slot.id }, 'totalProposals', 1);

    return saved;
}

// Get proposals for a slot (user sees these)
export async function getProposalsForSlot(slotId: string, userId: string): Promise<MarketingProposalEntity[]> {
    // Verify slot ownership
    const slot = await SlotRepository.findOne({ where: { id: slotId, userId } });
    
    if (!slot) {
        throw new ApiError(APIErrors.notFoundError, "Slot not found or not authorized", 404);
    }

    return await ProposalRepository.find({
        where: { slotId },
        relations: ['company'],
        order: { createdAt: 'DESC' }
    });
}

// Get proposals created by company
export async function getMyProposals(companyId: string): Promise<MarketingProposalEntity[]> {
    return await ProposalRepository.find({
        where: { companyId },
        relations: ['slot'],
        order: { createdAt: 'DESC' }
    });
}

// Accept proposal
export async function acceptProposal(proposalId: string, userId: string): Promise<MarketingProposalEntity> {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId },
        relations: ['slot']
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }

    // Verify slot ownership
    if (proposal.slot.userId !== userId) {
        throw new ApiError(APIErrors.forbiddenError, "Not authorized", 403);
    }

    // Check if still pending
    if (proposal.status !== 'pending') {
        throw new ApiError(APIErrors.forbiddenError, "Proposal is not pending", 403);
    }

    // Check if slot is still available
    if (proposal.slot.status !== 'available') {
        throw new ApiError(APIErrors.forbiddenError, "Slot is no longer available", 403);
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + proposal.slot.duration);

    // Update proposal
    proposal.status = 'active';
    proposal.respondedAt = new Date();

    // Update slot
    proposal.slot.status = 'occupied';
    proposal.slot.activeProposalId = proposal.id;
    proposal.slot.activeSince = new Date();
    proposal.slot.expiresAt = expiresAt;
    proposal.slot.totalRevenue = Number(proposal.slot.totalRevenue) + Number(proposal.proposedPrice);

    await SlotRepository.save(proposal.slot);
    await ProposalRepository.save(proposal);

    // Reject all other pending proposals for this slot
    await ProposalRepository.update(
        {
            slotId: proposal.slotId,
            status: 'pending',
            id: In([proposal.id]) // Exclude this one
        },
        {
            status: 'rejected',
            respondedAt: new Date(),
            rejectionReason: 'Another proposal was accepted'
        }
    );

    return proposal;
}

// Reject proposal
export async function rejectProposal(proposalId: string, userId: string, reason?: string): Promise<MarketingProposalEntity> {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId },
        relations: ['slot']
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }

    // Verify slot ownership
    if (proposal.slot.userId !== userId) {
        throw new ApiError(APIErrors.forbiddenError, "Not authorized", 403);
    }

    if (proposal.status !== 'pending') {
        throw new ApiError(APIErrors.forbiddenError, "Proposal is not pending", 403);
    }

    proposal.status = 'rejected';
    proposal.respondedAt = new Date();
    proposal.rejectionReason = reason || 'Rejected by user';

    return await ProposalRepository.save(proposal);
}

// Track impression
export async function trackImpression(proposalId: string): Promise<void> {
    await ProposalRepository.increment({ id: proposalId }, 'impressions', 1);
}

// Track click
export async function trackClick(proposalId: string): Promise<void> {
    await ProposalRepository.increment({ id: proposalId }, 'clicks', 1);
}

// Get analytics for proposal
export async function getProposalAnalytics(proposalId: string, userId: string) {
    const proposal = await ProposalRepository.findOne({
        where: { id: proposalId },
        relations: ['slot']
    });

    if (!proposal) {
        throw new ApiError(APIErrors.notFoundError, "Proposal not found", 404);
    }

    // Can be viewed by slot owner or company
    if (proposal.slot.userId !== userId && proposal.companyId !== userId) {
        throw new ApiError(APIErrors.forbiddenError, "Not authorized", 403);
    }

    const ctr = proposal.impressions > 0 
        ? ((proposal.clicks / proposal.impressions) * 100).toFixed(2)
        : '0.00';

    return {
        impressions: proposal.impressions,
        clicks: proposal.clicks,
        ctr,
        proposedPrice: proposal.proposedPrice,
        status: proposal.status
    };
}

import { Router } from "express";
import { z } from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import * as ProposalService from "../../../shared/services/marketing-proposal.service";
import { createProposalPaymentLink } from "../../../shared/services/stripe.service";
import { sendPaymentLinkEmail } from "../../../services/email.service";
import { AppDataSource } from "../../../database/datasource";
import { MarketingProposalEntity } from "../../../database/entity/marketing-proposal-entity";
import { BioEntity } from "../../../database/entity/bio-entity";

const router: Router = Router();

// Generate payment link for a proposal
// :id here is the bioId for ownerMiddleware, proposalId comes from body
router.post("/:id/generate-payment-link", ownerMiddleware, async (req, res) => {
    const { proposalId } = z.object({ proposalId: z.string().uuid() }).parse(req.body);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;

    try {
        const proposalRepo = AppDataSource.getRepository(MarketingProposalEntity);
        const proposal = await proposalRepo.findOne({
            where: { id: proposalId },
            relations: ['slot', 'company'],
        });

        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }

        // Verify slot ownership (double check after ownerMiddleware)
        if (proposal.slot.userId !== userId) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Check if proposal is pending
        if (proposal.status !== 'pending') {
            return res.status(400).json({ error: "Proposal is not pending" });
        }

        let paymentLinkUrl = proposal.paymentLink;
        let expiresAt = proposal.paymentLinkExpiry;

        // Check if we need to generate a new link (if none exists or expired)
        if (!paymentLinkUrl || !expiresAt || new Date() > expiresAt) {
            // Get bio and stripe integration
            const bioRepo = AppDataSource.getRepository(BioEntity);
            const bio = await bioRepo.findOne({
                where: { id: proposal.slot.bioId },
                relations: ['integrations']
            });

            const stripeIntegration = bio?.integrations?.find(i => i.name === 'stripe' && i.account_id);
            if (!stripeIntegration?.account_id) {
                return res.status(403).json({ error: "Stripe account not connected" });
            }

            // Create Stripe payment link
            const paymentLink = await createProposalPaymentLink(
                proposal.id,
                Number(proposal.proposedPrice),
                proposal.slot.slotName,
                proposal.slot.duration,
                stripeIntegration.account_id
            );

            paymentLinkUrl = paymentLink.url;
            
            // Set expiry to 7 days from now
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Update proposal with payment link
            proposal.paymentLink = paymentLinkUrl;
            proposal.paymentLinkExpiry = expiresAt;
            await proposalRepo.save(proposal);
        }

        // Send email
        const recipientEmail = proposal.guestEmail || proposal.company?.email;
        const recipientName = proposal.guestName || proposal.company?.email?.split('@')[0] || "Advertiser";

        if (!recipientEmail) {
            return res.status(400).json({ error: "No email found for proposal" });
        }

        await sendPaymentLinkEmail({
            to: recipientEmail,
            companyName: recipientName,
            slotName: proposal.slot.slotName,
            price: Number(proposal.proposedPrice),
            duration: proposal.slot.duration,
            paymentLink: paymentLinkUrl!,
            expiresAt: expiresAt!,
        });

        return res.status(200).json({ 
            message: "Payment link sent successfully",
            paymentLink: paymentLinkUrl,
            expiresAt 
        });
    } catch (error: any) {
        console.error("Error generating payment link:", error);
        return res.status(500).json({ error: error.message || "Failed to generate payment link" });
    }
});

export default router;

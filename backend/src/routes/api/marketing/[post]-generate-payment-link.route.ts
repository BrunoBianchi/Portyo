import { Router } from "express";
import { z } from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import * as ProposalService from "../../../shared/services/marketing-proposal.service";
import { createProposalPaymentLink } from "../../../shared/services/stripe.service";
import { sendPaymentLinkEmail } from "../../../services/email.service";
import { AppDataSource } from "../../../database/datasource";
import { MarketingProposalEntity } from "../../../database/entity/marketing-proposal-entity";

const router: Router = Router();

// Generate payment link for a proposal
router.post("/:id/generate-payment-link", ownerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;

    try {
        const proposalRepo = AppDataSource.getRepository(MarketingProposalEntity);
        const proposal = await proposalRepo.findOne({
            where: { id },
            relations: ['slot', 'company'],
        });

        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }

        // Verify slot ownership
        if (proposal.slot.userId !== userId) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Check if proposal is pending
        if (proposal.status !== 'pending') {
            return res.status(400).json({ error: "Proposal is not pending" });
        }

        // Check if payment link already exists and is not expired
        if (proposal.paymentLink && proposal.paymentLinkExpiry) {
            if (new Date() < proposal.paymentLinkExpiry) {
                return res.status(200).json({ 
                    message: "Payment link already sent",
                    paymentLink: proposal.paymentLink 
                });
            }
        }

        // Create Stripe payment link
        const paymentLink = await createProposalPaymentLink(
            proposal.id,
            Number(proposal.proposedPrice),
            proposal.slot.slotName,
            proposal.slot.duration
        );

        // Set expiry to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Update proposal with payment link
        proposal.paymentLink = paymentLink.url;
        proposal.paymentLinkExpiry = expiresAt;
        await proposalRepo.save(proposal);

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
            paymentLink: paymentLink.url,
            expiresAt,
        });

        return res.status(200).json({ 
            message: "Payment link sent successfully",
            paymentLink: paymentLink.url,
            expiresAt 
        });
    } catch (error: any) {
        console.error("Error generating payment link:", error);
        return res.status(500).json({ error: error.message || "Failed to generate payment link" });
    }
});

export default router;

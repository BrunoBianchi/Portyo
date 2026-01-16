import { Router } from "express";
import { z } from "zod";
import * as SlotService from "../../../shared/services/marketing-slot.service";

import * as ProposalService from "../../../shared/services/marketing-proposal.service";

const router: Router = Router();

// Public: List available slots (for companies to browse)
router.get("/slots", async (req, res) => {
    const schema = z.object({
        priceMax: z.coerce.number().optional(),
        minImpressions: z.coerce.number().optional(),
        bioId: z.string().optional()
    });
    
    const filters = schema.parse(req.query);
    const slots = await SlotService.getAvailableSlots(filters);
    
    return res.status(200).json(slots);
});

// Public: Get slot details
router.get("/slots/:id", async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    
    const slot = await SlotService.getSlotById(id);
    return res.status(200).json(slot);
});

// Public: Send proposal
router.post("/proposals", async (req, res) => {
    const schema = z.object({
        slotId: z.string().uuid(),
        bidAmount: z.number().positive(),
        message: z.string().optional(),
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        link: z.string().url(),
        imageUrl: z.string().url(),
        duration: z.number().optional()
    });

    try {
        const body = schema.parse(req.body);

        const proposal = await ProposalService.createProposal(null, {
            slotId: body.slotId,
            proposedPrice: body.bidAmount,
            message: body.message,
            guestName: body.name,
            guestEmail: body.email,
            content: {
                title: body.company,
                description: body.message || "",
                linkUrl: body.link,
                imageUrl: body.imageUrl,
                sponsorLabel: "Sponsored"
            }
        });

        return res.status(201).json(proposal);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid input", errors: (error as any).errors });
        }
        throw error;
    }
});

// Public: Track impression
router.post("/impressions", async (req, res) => {
    const schema = z.object({ proposalId: z.string().uuid() });
    try {
        const { proposalId } = schema.parse(req.body);
        await ProposalService.trackImpression(proposalId);
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(400).json({ message: "Invalid request" });
    }
});

// Public: Track click
router.post("/clicks", async (req, res) => {
    const schema = z.object({ proposalId: z.string().uuid() });
    try {
        const { proposalId } = schema.parse(req.body);
        await ProposalService.trackClick(proposalId);
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(400).json({ message: "Invalid request" });
    }
});

import publicProposalsRouter from '../marketing/public-proposals.route';
router.use("/proposals", publicProposalsRouter);

export default router;

import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import * as ProposalService from "../../../shared/services/marketing-proposal.service";

const router: Router = Router();

// Get proposals for my slots
router.get("/received", authMiddleware, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { slotId } = z.object({ slotId: z.string().uuid() }).parse(req.query);
    
    const proposals = await ProposalService.getProposalsForSlot(slotId, userId);
    return res.status(200).json(proposals);
});

// Get proposals I created (as company)
router.get("/sent", authMiddleware, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const companyId = req.user.id;
    
    const proposals = await ProposalService.getMyProposals(companyId);
    return res.status(200).json(proposals);
});

// Create proposal (company submits)
const createSchema = z.object({
    slotId: z.string().uuid(),
    proposedPrice: z.number().min(0),
    message: z.string().optional(),
    content: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        imageUrl: z.string().url().optional(),
        linkUrl: z.string().url(),
        buttonText: z.string().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        buttonColor: z.string().optional(),
        buttonTextColor: z.string().optional(),
        layout: z.enum(['card', 'banner', 'compact', 'featured']).optional(),
        sponsorLabel: z.string().optional()
    })
});

router.post("/", authMiddleware, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const companyId = req.user.id;
    const data = createSchema.parse(req.body);
    
    const proposal = await ProposalService.createProposal(companyId, data);
    return res.status(201).json(proposal);
});

// Accept proposal
router.put("/:id/accept", authMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    
    const proposal = await ProposalService.acceptProposal(id, userId);
    return res.status(200).json(proposal);
});

// Reject proposal
router.put("/:id/reject", authMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);
    
    const proposal = await ProposalService.rejectProposal(id, userId, reason);
    return res.status(200).json(proposal);
});

// Get analytics
router.get("/:id/analytics", authMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    
    const analytics = await ProposalService.getProposalAnalytics(id, userId);
    return res.status(200).json(analytics);
});

// Track click (public)
router.post("/:id/click", async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    
    await ProposalService.trackClick(id);
    return res.status(200).json({ success: true });
});

export default router;

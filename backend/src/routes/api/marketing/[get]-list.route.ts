import { Router } from "express";
import z from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { getMarketingBlocksByUser, getMarketingBlocksByBio } from "../../../shared/services/marketing.service";

const router: Router = Router();

// List all marketing blocks for authenticated user
router.get("/", ownerMiddleware, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const blocks = await getMarketingBlocksByUser(userId);
    return res.status(200).json(blocks);
});

// List marketing blocks for a specific bio
router.get("/bio/:bioId", ownerMiddleware, async (req, res) => {
    const { bioId } = z.object({ bioId: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    
    // Note: This will get blocks from the bio, but we should verify ownership
    // The service will handle ownership verification
    const blocks = await getMarketingBlocksByBio(bioId);
    
    // Filter to only return blocks owned by this user
    const userBlocks = blocks.filter(block => block.userId === userId);
    
    return res.status(200).json(userBlocks);
});

export default router;

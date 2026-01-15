import { Router } from "express";
import z from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { createMarketingBlock, CreateMarketingBlockData } from "../../../shared/services/marketing.service";

const router: Router = Router();

// Schema for content validation
const contentSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    imageUrl: z.string().url().optional(),
    linkUrl: z.string().url(),
    buttonText: z.string().max(50).optional(),
    
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    buttonTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    
    layout: z.enum(['card', 'banner', 'compact', 'featured']).optional(),
    showImage: z.boolean().optional(),
    showButton: z.boolean().optional(),
    
    sponsorLabel: z.string().max(20).optional()
});

const createSchema = z.object({
    bioId: z.string().uuid(),
    content: contentSchema,
    expiresAt: z.string().datetime().optional(),
    position: z.number().int().min(0).optional()
});

router.post("/", ownerMiddleware, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const data = createSchema.parse(req.body);
    
    const blockData: CreateMarketingBlockData = {
        bioId: data.bioId,
        content: data.content,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        position: data.position
    };
    
    const block = await createMarketingBlock(userId, blockData);
    
    return res.status(201).json(block);
});

export default router;

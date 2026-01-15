import { Router } from "express";
import z from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { updateMarketingBlock, UpdateMarketingBlockData } from "../../../shared/services/marketing.service";

const router: Router = Router();

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
}).optional();

const updateSchema = z.object({
    content: contentSchema,
    isActive: z.boolean().optional(),
    isPaid: z.boolean().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
    position: z.number().int().min(0).optional()
});

router.put("/:id", ownerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const data = updateSchema.parse(req.body);
    
    const updateData: UpdateMarketingBlockData = {
        content: data.content,
        isActive: data.isActive,
        isPaid: data.isPaid,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        position: data.position
    };
    
    const block = await updateMarketingBlock(id, userId, updateData);
    
    return res.status(200).json(block);
});

export default router;

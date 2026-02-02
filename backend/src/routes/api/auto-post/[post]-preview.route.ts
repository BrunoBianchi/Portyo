import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { autoPostRateLimiters } from "../../../middleware/rate-limit.middleware";
import { generatePreviewPost } from "../../../services/auto-post.service";
import z from "zod";

const router: Router = Router();

const previewSchema = z.object({
    bioId: z.string(),
    topics: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tone: z.string().optional(),
    postLength: z.enum(["short", "medium", "long"]).optional(),
    targetAudience: z.string().optional(),
    preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    targetCountry: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
});

router.post("/preview", authMiddleware, isUserPro, autoPostRateLimiters.preview, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const data = previewSchema.parse(req.body);

        // Generate preview with full metrics
        const generatedPost = await generatePreviewPost(userId, data.bioId, {
            topics: data.topics || null,
            keywords: data.keywords || null,
            targetAudience: data.targetAudience || null,
            tone: data.tone || "professional",
            postLength: data.postLength || "medium",
            preferredTime: data.preferredTime || "09:00",
            targetCountry: data.targetCountry || null,
            language: data.language || null,
        });

        return res.status(200).json({
            generatedPost,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { autoPostRateLimiters } from "../../../middleware/rate-limit.middleware";
import { generateMetadataFromTopicsService } from "../../../services/auto-post.service";
import z from "zod";

const router: Router = Router();

const metadataSchema = z.object({
    bioId: z.string(),
    topics: z.string().min(1, "Topics are required"),
    targetCountry: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
});

/**
 * Generate SEO metadata (keywords, tags, target audience) from topics
 * Called when user enters topics first
 */
router.post("/generate-metadata", authMiddleware, isUserPro, autoPostRateLimiters.metadata, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const data = metadataSchema.parse(req.body);

        // Generate metadata from topics
        const metadata = await generateMetadataFromTopicsService(
            userId,
            data.bioId,
            data.topics,
            data.targetCountry,
            data.language
        );

        return res.status(200).json({
            metadata,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

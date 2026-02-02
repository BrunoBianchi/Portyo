import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { autoPostRateLimiters } from "../../../middleware/rate-limit.middleware";
import { createOrUpdateSchedule } from "../../../services/auto-post.service";
import { PostFrequency } from "../../../database/entity/auto-post-schedule-entity";
import z from "zod";

const router: Router = Router();

const createScheduleSchema = z.object({
    bioId: z.string(),
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
    topics: z.string().optional().nullable(),
    keywords: z.array(z.string()).optional().nullable(),
    targetAudience: z.string().optional().nullable(),
    tone: z.enum(["professional", "casual", "friendly", "technical", "creative", "authoritative"]).optional(),
    postLength: z.enum(["short", "medium", "long"]).optional(),
    language: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    startDate: z.string().datetime().optional().nullable(),
    targetCountry: z.string().optional().nullable(),
});

router.post("/", authMiddleware, isUserPro, autoPostRateLimiters.schedule, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const data = createScheduleSchema.parse(req.body);
        
        const schedule = await createOrUpdateSchedule(userId, data.bioId, {
            frequency: data.frequency as PostFrequency,
            topics: data.topics,
            keywords: data.keywords,
            targetAudience: data.targetAudience,
            tone: data.tone,
            postLength: data.postLength,
            language: data.language,
            isActive: data.isActive,
            preferredTime: data.preferredTime,
            startDate: data.startDate ? new Date(data.startDate) : null,
            targetCountry: data.targetCountry,
        });

        return res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
});

export default router;

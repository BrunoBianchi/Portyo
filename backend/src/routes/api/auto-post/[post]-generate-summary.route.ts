import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { autoPostRateLimiters } from "../../../middleware/rate-limit.middleware";
import { generateAndSaveBioSummary, getScheduleByBioId } from "../../../services/auto-post.service";
import z from "zod";

const router: Router = Router();

const generateSchema = z.object({
    bioId: z.string(),
});

router.post("/generate-summary", authMiddleware, isUserPro, autoPostRateLimiters.summary, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const data = generateSchema.parse(req.body);
        
        let schedule = await getScheduleByBioId(userId, data.bioId);
        
        if (!schedule) {
            // Create a temporary schedule to generate summary
            const { createOrUpdateSchedule } = await import("../../../services/auto-post.service");
            schedule = await createOrUpdateSchedule(userId, data.bioId, { isActive: false });
        }

        const summary = await generateAndSaveBioSummary(schedule);

        return res.status(200).json({
            summary,
            schedule,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

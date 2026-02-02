import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { getScheduleByBioId, getUserSchedules } from "../../../services/auto-post.service";
import z from "zod";

const router: Router = Router();

// Get schedule for a specific bio
router.get("/:bioId", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const schedule = await getScheduleByBioId(userId, bioId);
        
        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }

        return res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
});

// Get all schedules for user
router.get("/", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const schedules = await getUserSchedules(userId);
        return res.status(200).json(schedules);
    } catch (error) {
        next(error);
    }
});

export default router;

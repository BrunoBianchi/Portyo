import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { toggleScheduleStatus } from "../../../services/auto-post.service";
import z from "zod";

const router: Router = Router();

const toggleSchema = z.object({
    bioId: z.string(),
    isActive: z.boolean(),
});

router.patch("/toggle", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const data = toggleSchema.parse(req.body);
        
        const schedule = await toggleScheduleStatus(userId, data.bioId, data.isActive);

        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }

        return res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
});

export default router;

import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { deleteSchedule } from "../../../services/auto-post.service";
import z from "zod";

const router: Router = Router();

router.delete("/:bioId", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
        
        const deleted = await deleteSchedule(userId, bioId);

        if (!deleted) {
            return res.status(404).json({ error: "Schedule not found" });
        }

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;

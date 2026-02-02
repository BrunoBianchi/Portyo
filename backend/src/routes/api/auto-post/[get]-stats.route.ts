import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { getAutoPostStats } from "../../../services/auto-post.service";
import z from "zod";

const router: Router = Router();

router.get("/:bioId/stats", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
        
        const stats = await getAutoPostStats(userId, bioId);

        return res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
});

export default router;

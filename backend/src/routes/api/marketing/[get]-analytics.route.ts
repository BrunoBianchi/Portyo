import { Router } from "express";
import z from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { getMarketingBlockAnalytics } from "../../../shared/services/marketing.service";

const router: Router = Router();

router.get("/:id/analytics", ownerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    
    const analytics = await getMarketingBlockAnalytics(id, userId);
    
    return res.status(200).json(analytics);
});

export default router;

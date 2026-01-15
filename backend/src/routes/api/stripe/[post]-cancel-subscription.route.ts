import { Router, Request, Response } from "express";
import { BillingService } from "../../../services/billing.service";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { logger } from "../../../shared/utils/logger";

const router = Router();

router.post("/cancel-subscription", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id!;
        
        await BillingService.cancelSubscription(userId);
        
        logger.info(`User ${userId} canceled their subscription`);
        res.status(200).json({ success: true, message: "Subscription canceled successfully" });
    } catch (error: any) {
        logger.error(`Error canceling subscription for user ${req.user?.id}:`, error);
        res.status(400).json({ error: error.message || "Failed to cancel subscription" });
    }
});

export default router;

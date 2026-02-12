import { Router, Request, Response } from "express";
import { BillingService } from "../../../services/billing.service";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { logger } from "../../../shared/utils/logger";

const router = Router();

router.post("/start-trial", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id!;

        const trial = await BillingService.ensureStandardTrial(userId, 7);
        if (!trial) {
            return res.status(409).json({ error: "Trial already used" });
        }

        const activePlan = await BillingService.getActivePlan(userId);

        logger.info(`User ${userId} started 7-day standard trial`);
        return res.status(200).json({
            success: true,
            message: "7-day trial activated",
            plan: activePlan,
            trialEndsAt: trial.endDate,
        });
    } catch (error: any) {
        logger.error(`Error starting trial for user ${req.user?.id}:`, error);
        return res.status(400).json({ error: error.message || "Failed to start trial" });
    }
});

export default router;

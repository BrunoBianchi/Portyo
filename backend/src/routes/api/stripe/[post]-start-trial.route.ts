import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { logger } from "../../../shared/utils/logger";
import { env } from "../../../config/env";
import { BillingService } from "../../../services/billing.service";

const router = Router();

const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover" as any,
});

router.post("/start-trial", requireAuth, async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        const trialEligible = !(await BillingService.hasUsedStandardTrial(user.id!));
        if (!trialEligible) {
            return res.status(409).json({ error: "Trial already used" });
        }

        const prices = await stripe.prices.list({
            product: "prod_TmL9tzn3rbw9RT",
            active: true,
            expand: ['data.tiers']
        });

        const monthlyPrice = prices.data.find((p) => p.recurring?.interval === 'month' && p.recurring?.interval_count === 1);
        if (!monthlyPrice) {
            return res.status(500).json({ error: "Price configuration error" });
        }

        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            client_reference_id: user.id,
            line_items: [{ price: monthlyPrice.id, quantity: 1 }],
            mode: "subscription",
            success_url: `${env.FRONTEND_URL}/dashboard?checkout=success`,
            cancel_url: `${env.FRONTEND_URL}/dashboard?checkout=cancel`,
            metadata: {
                userId: user.id!,
                plan: 'standard',
                interval: 'monthly',
                trialApplied: 'true'
            },
            subscription_data: {
                trial_period_days: 7,
                metadata: {
                    userId: user.id!,
                    plan: 'standard',
                }
            }
        });

        logger.info(`User ${user.id} initiated 7-day standard trial via Stripe`);
        return res.status(200).json({
            success: true,
            message: "7-day Stripe trial checkout created",
            url: session.url,
        });
    } catch (error: any) {
        logger.error(`Error starting trial for user ${req.user?.id}:`, error);
        return res.status(400).json({ error: error.message || "Failed to start trial" });
    }
});

export default router;

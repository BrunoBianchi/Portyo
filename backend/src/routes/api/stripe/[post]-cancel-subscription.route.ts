import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../../../config/env";
import { logger } from "../../../shared/utils/logger";
import { BillingEntity } from "../../../database/entity/billing-entity";
import { AppDataSource } from "../../../database/datasource";

const router: Router = Router();

// Initialize Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover" as any,
});

router.post("/cancel-subscription", async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Find the most recent billing record to get the customer ID
        const billingRepo = AppDataSource.getRepository(BillingEntity);
        const billing = await billingRepo.findOne({
            where: { userId: user.id },
            order: { endDate: "DESC" }
        });

        if (!billing || !billing.stripeCustomerId) {
            return res.status(404).json({ error: "No active subscription found to cancel." });
        }

        // List active subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
            customer: billing.stripeCustomerId,
            status: 'active',
            limit: 100
        });

        if (subscriptions.data.length === 0) {
             return res.status(404).json({ error: "No active subscriptions found in Stripe." });
        }

        // Cancel all active subscriptions at period end
        const cancellationPromises = subscriptions.data.map(sub => 
            stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
        );

        await Promise.all(cancellationPromises);

        logger.info(`Canceled subscription(s) for user ${user.id} (Customer ${billing.stripeCustomerId})`);

        res.json({ message: "Subscription canceled successfully. Access remains until the end of the billing period." });

    } catch (error: any) {
        logger.error("Error canceling subscription", { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

export default router;

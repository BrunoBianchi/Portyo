import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../../../config/env";
import { logger } from "../../../shared/utils/logger";
import { UserEntity } from "../../../database/entity/user-entity";

const router: Router = Router();

// Initialize Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover" as any,
});

router.post("/create-checkout-session", async (req: Request, res: Response) => {
    try {
        const { plan, interval } = req.body;
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!['standard', 'pro'].includes(plan)) {
            return res.status(400).json({ error: "Invalid plan" });
        }

        if (!['monthly', 'annually'].includes(interval)) {
            return res.status(400).json({ error: "Invalid interval" });
        }

        const productIds = {
            standard: "prod_TmL9tzn3rbw9RT",
            pro: "prod_TmL8KujlcWIkE5"
        };

        const productId = productIds[plan as 'standard' | 'pro'];

        // Fetch prices for the product
        const prices = await stripe.prices.list({
            product: productId,
            active: true,
            lookup_keys: [], // Clear lookup keys filter if any
            expand: ['data.tiers']
        });

        // Find the price matching the interval
        const price = prices.data.find(p => {
             if (interval === 'monthly') return p.recurring?.interval === 'month' && p.recurring.interval_count === 1;
             if (interval === 'annually') return p.recurring?.interval === 'year' && p.recurring.interval_count === 1;
             return false;
        });

        if (!price) {
             logger.error(`No price found for plan ${plan} and interval ${interval}`, { productId });
             return res.status(500).json({ error: "Price configuration error" });
        }

        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            client_reference_id: user.id,
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${env.FRONTEND_URL}/dashboard?checkout=success`,
            cancel_url: `${env.FRONTEND_URL}/dashboard?checkout=cancel`,
            metadata: {
                userId: user.id,
                plan: plan,
                interval: interval
            },
            subscription_data: {
                metadata: {
                     userId: user.id,
                     plan: plan
                }
            }
        });

        res.json({ url: session.url });
    } catch (error: any) {
        logger.error("Error creating checkout session", { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

export default router;

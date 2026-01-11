import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../../../config/env";
import { logger } from "../../../shared/utils/logger";
import { BillingService } from "../../../services/billing.service";
import { findUserByEmail, findUserById } from "../../../shared/services/user.service";

const router: Router = Router();

// Initialize Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover" as any, // Use version matching project config
});

router.post("/webhook", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        logger.error("STRIPE_WEBHOOK_SECRET is not defined in environment");
        return res.status(500).send("Server Configuration Error");
    }

    let event: Stripe.Event;

    try {
        // Verify signature using raw body
        if (!req.rawBody) {
             throw new Error("Raw body not available");
        }
        
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig as string,
            webhookSecret
        );
    } catch (err: any) {
        logger.error(`Webhook Signature Verification Failed: ${err.message}`, {
            ip: req.ip,
            signature: sig
        });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case "invoice.paid":
                await handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            default:
                // logger.debug(`Unhandled event type: ${event.type}`);
                break;
        }

        res.status(200).json({ received: true });
    } catch (err: any) {
        logger.error(`Error processing webhook event ${event.type}: ${err.message}`);
        res.status(500).send(`Handler Error`);
    }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId;
    const plan = session.metadata?.plan as 'standard' | 'pro';
    
    if (!userId || !plan) {
        logger.warn("Missing userId or plan in checkout session metadata/reference", { id: session.id });
        return;
    }

    const user = await findUserById(userId);
    if (!user) {
        logger.warn(`User not found for checkout session`, { userId });
        return;
    }

    // Default to 30 days if not specified
    const days = 30;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    await BillingService.createBilling(userId, plan, days, amount);
    logger.info(`Processed checkout for user ${userId}: ${plan} plan activated`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const email = invoice.customer_email;
    if (!email) {
         return; // Can't identify user easily
    }

    const user = await findUserByEmail(email);
    if (!user) return;

    // Detect plan from lines or metadata
    // Simplification: Check if "pro" or "standard" is in description
    // In production, use Product ID lookup
    const lineItem = invoice.lines.data[0];
    const description = lineItem?.description?.toLowerCase() || "";
    let plan: 'standard' | 'pro' = 'standard';
    
    if (description.includes('pro')) plan = 'pro';
    
    // Add 30 days
    await BillingService.createBilling(user.id, plan, 30, invoice.amount_paid / 100);
    logger.info(`Processed invoice renewal for user ${user.id} (${email})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // We rely on billing expiration, so explicit deletion isn't strictly necessary per BillingService 
    // functionality (getActivePlan checks date), but logging is good.
    logger.info(`Subscription deleted for customer ${subscription.customer}`);
}

export default router;

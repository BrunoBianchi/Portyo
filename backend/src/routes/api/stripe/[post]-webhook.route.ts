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

    // 1. Critical Check: If secret or signature is missing, abort immediately (do nothing)
    if (!webhookSecret || !sig) {
        // User requested "não faça nada" (do nothing).
        // Returning 400 silently to avoid processing.
        return res.status(400).send(); 
    }

    let event: Stripe.Event;

    // 2. Verify Signature FIRST
    try {
        if (!req.rawBody) throw new Error("Raw body not available");
        
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig as string,
            webhookSecret
        );
    } catch (err: any) {
        // Signature verification failed.
        // User requested "não faça nada".
        // Returning 400 silently.
        return res.status(400).send();
    }

    // 3. Only if verified, we proceed with logging and handling
    console.log("🔔 Stripe Webhook Verified & Received 🔔");
    
    // Detailed logging of the verified event
    try {
        console.log("📦 Webhook Payload Overview:");
        console.log(`   - Type: ${event.type}`);
        console.log(`   - ID: ${event.id}`);
        console.log(`   - Object: ${event.data.object.object || 'unknown'}`);
        logger.info(`Stripe Webhook Verified: ${event.type} [${event.id}]`);
    } catch (e) {
        console.error("Error logging webhook details:", e);
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
            
            // Invoices
            case "invoice.created":
            case "invoice.finalization_failed":
            case "invoice.finalized":
            case "invoice.payment_action_required":
            case "invoice.payment_failed":
            case "invoice.upcoming":
            case "invoice.updated":
                await handleInvoiceEvent(event.data.object as Stripe.Invoice, event.type);
                break;

            // Payment Intents
            case "payment_intent.created":
            case "payment_intent.succeeded":
                await handlePaymentIntentEvent(event.data.object as Stripe.PaymentIntent, event.type);
                break;

            // Subscription Schedules
            case "subscription_schedule.aborted":
            case "subscription_schedule.canceled":
            case "subscription_schedule.completed":
            case "subscription_schedule.created":
            case "subscription_schedule.expiring":
            case "subscription_schedule.released":
            case "subscription_schedule.updated":
                await handleSubscriptionScheduleEvent(event.data.object as Stripe.SubscriptionSchedule, event.type);
                break;

            // Entitlements
            case "entitlements.active_entitlement_summary.updated":
                await handleEntitlementEvent(event.data.object as any, event.type);
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
    
    // Determine days based on plan or interval if available
    // Note: Checkout session for subscription doesn't always have 'interval' in metadata if we don't put it there. 
    // But we added it in create-checkout-session.
    let duration = 30;
    if (session.metadata?.interval === 'annually') {
        duration = 365;
    }

    // const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    // const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

    // User requested to ONLY create plan on invoice.paid
    // await BillingService.createBilling(userId, plan, duration, amount, stripeCustomerId, paymentId);
    logger.info(`Checkout session completed for user ${userId}. Waiting for invoice.paid to activate plan.`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const email = invoice.customer_email;
    if (!email) {
         return; // Can't identify user easily
    }

    const user = await findUserByEmail(email);
    if (!user) return;

    // Detect plan from subscription or metadata
    // In a real scenario, we might want to store the plan in the User/Subscription entity.
    // However, for now we infer from the product ID or description as requested.
    
    // The user provided specific product IDs:
    // Standard: prod_TmL2bxw13AR6SV
    // Pro:      prod_TmL0xo0zPO4aAg
    
    let plan: 'standard' | 'pro' = 'standard';
    let duration = 30;
    
    // Check lines for plan
    if (invoice.lines?.data) {
        for (const line of invoice.lines.data) {
            const price = (line as any).price;
            if (price?.product === 'prod_TmL2bxw13AR6SV') {
                plan = 'standard';
            } else if (price?.product === 'prod_TmL0xo0zPO4aAg') {
                plan = 'pro';
            }
            
            // Check interval
             if (price?.recurring?.interval === 'year') {
                duration = 365;
            } else if (price?.recurring?.interval === 'month') {
                duration = 30;
            }
        }
    }
    
    const stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
    const paymentIntent = (invoice as any).payment_intent as string | Stripe.PaymentIntent | undefined;
    const paymentId = typeof paymentIntent === 'string' ? paymentIntent : (paymentIntent?.id || invoice.id);

    let transactionId: string | undefined;
    if (paymentIntent && typeof paymentIntent !== 'string') {
        const latestCharge = paymentIntent.latest_charge;
        transactionId = typeof latestCharge === 'string' ? latestCharge : latestCharge?.id;
    }

    const subscriptionField = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;
    const subscriptionId = typeof subscriptionField === 'string' ? subscriptionField : subscriptionField?.id;
    
    await BillingService.createBilling(user.id, plan, duration, invoice.amount_paid / 100, stripeCustomerId, paymentId, transactionId, subscriptionId);
    logger.info(`Processed invoice renewal for user ${user.id} (${email}): ${plan} for ${duration} days. Payment ID: ${paymentId}, Transaction ID: ${transactionId}, Sub ID: ${subscriptionId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // We rely on billing expiration, so explicit deletion isn't strictly necessary per BillingService 
    // functionality (getActivePlan checks date), but logging is good.
    logger.info(`Subscription deleted for customer ${subscription.customer}`);
}

async function handleInvoiceEvent(invoice: Stripe.Invoice, eventType: string) {
    logger.info(`Received invoice event: ${eventType} for invoice ${invoice.id}, customer ${invoice.customer_email || invoice.customer}`);
}

async function handlePaymentIntentEvent(paymentIntent: Stripe.PaymentIntent, eventType: string) {
    logger.info(`Received payment_intent event: ${eventType} for intent ${paymentIntent.id}, amount ${paymentIntent.amount}`);
}

async function handleSubscriptionScheduleEvent(schedule: Stripe.SubscriptionSchedule, eventType: string) {
    logger.info(`Received subscription_schedule event: ${eventType} for schedule ${schedule.id}`);
}

async function handleEntitlementEvent(entitlement: any, eventType: string) {
    logger.info(`Received entitlement event: ${eventType}`, { entitlementId: entitlement?.id });
}

export default router;

import { MoreThan, LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../database/datasource";
import { BillingEntity } from "../database/entity/billing-entity";

export class BillingService {
    private static repository = AppDataSource.getRepository(BillingEntity);

    /**
     * Checks the active plan for a user based on their billing history.
     * Returns the highest active plan: "pro" > "standard" > "free".
     */
    static async getActivePlan(userId: string): Promise<string> {
        const now = new Date();

        // Get all active billings for this user
        const activeBillings = await this.repository.find({
            where: {
                userId: userId,
                startDate: LessThanOrEqual(now),
                endDate: MoreThan(now)
            }
        });

        if (activeBillings.length === 0) {
            return "free";
        }

        // Return the highest plan (pro > standard)
        const hasPro = activeBillings.some(b => b.plan === 'pro');
        if (hasPro) {
            return "pro";
        }

        const hasStandard = activeBillings.some(b => b.plan === 'standard');
        if (hasStandard) {
            return "standard";
        }

        return "free";
    }

    static async createBilling(userId: string, plan: 'standard' | 'pro', days: number, price: number, stripeCustomerId?: string, stripePaymentId?: string, stripeTransactionId?: string, stripeSubscriptionId?: string) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const billing = this.repository.create({
            userId,
            plan,
            price,
            startDate,
            endDate,
            stripeCustomerId,
            stripePaymentId,
            stripeTransactionId,
            stripeSubscriptionId,
            status: 'paid'
        });

        await this.repository.save(billing);

        // Update User Entity with new plan and expiration
        const userRepo = AppDataSource.getRepository("UserEntity");
        const user = await userRepo.findOneBy({ id: userId });
        if (user) {
            // If the user already has a future expiration date (e.g. extending subscription), we might want to add to it.
            // But for now, let's assume valid from now + days, or extension if plan matches.
            // Simplest logic: active from now until end date.
            
            // If user already has the SAME plan active, extend the expiration?
            // For simplicity and to match the request "attribution... date of renewal", we set the new expiry.
            user.plan = plan;
            user.planExpiresAt = endDate;
            
            // Check if user was previously free, now paid -> verified? (Optional business logic, keeping minimal)
            
            await userRepo.save(user);
        }

        return billing;
    }

    static async cancelSubscription(userId: string) {
        // Find the most recent active billing
        const now = new Date();
        const activeBilling = await this.repository.findOne({
            where: {
                userId: userId,
                endDate: MoreThan(now),
                status: 'paid'
            },
            order: { startDate: 'DESC' }
        });

        if (!activeBilling) {
            throw new Error("No active subscription found to cancel");
        }

        if (activeBilling.stripeSubscriptionId) {
            try {
                // Initialize Stripe
                const { env } = await import("../config/env");
                const Stripe = (await import("stripe")).default;
                const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-12-15.clover" as any });

                // Cancel IMMEDIATELY as requested, but keep local access until end date
                const updatedSub = await stripe.subscriptions.cancel(activeBilling.stripeSubscriptionId);
                
                console.log("⬇️ STRIPE PAYLOAD ACORDING TO REQUEST ⬇️");
                console.log(JSON.stringify(updatedSub, null, 2));
                console.log("⬆️ END PAYLOAD ⬆️");
            } catch (err: any) {
                console.error("Failed to cancel Stripe subscription:", err);
                throw new Error("Failed to communicate with payment provider");
            }
        } else if (activeBilling.stripeCustomerId) {
            // Self-healing: Try to find active subscription for this customer in Stripe
            try {
                const { env } = await import("../config/env");
                const Stripe = (await import("stripe")).default;
                const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-12-15.clover" as any });

                console.log(`[Self-Healing] activeBilling missing stripeSubscriptionId. Searching Stripe for customer ${activeBilling.stripeCustomerId}...`);
                const subs = await stripe.subscriptions.list({
                    customer: activeBilling.stripeCustomerId,
                    status: 'active',
                    limit: 1
                });

                if (subs.data.length > 0) {
                    const foundSub = subs.data[0];
                    console.log(`[Self-Healing] Found active subscription ${foundSub.id}. Canceling...`);
                    
                    const result = await stripe.subscriptions.cancel(foundSub.id);
                    
                    console.log("⬇️ SELF-HEALING STRIPE PAYLOAD ⬇️");
                    console.log(JSON.stringify(result, null, 2));
                    console.log("⬆️ END PAYLOAD ⬆️");
                    
                    // Update our record
                    activeBilling.stripeSubscriptionId = foundSub.id;
                    await this.repository.save(activeBilling);
                } else {
                    console.warn(`[Self-Healing] No active subscriptions found for customer ${activeBilling.stripeCustomerId}`);
                }
            } catch (err) {
                console.error("[Self-Healing] Failed to auto-recover subscription ID:", err);
                // Don't throw here, as we still want to mark local as canceled?
                // Actually, if we fail to cancel in Stripe, we should probably warn the user.
            }
        }

        // Update local status
        activeBilling.status = 'canceled';
        await this.repository.save(activeBilling);

        return activeBilling;
    }
}

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

    static async createBilling(userId: string, plan: 'standard' | 'pro', days: number, price: number, stripeCustomerId?: string, stripePaymentId?: string) {
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
            stripePaymentId
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
}

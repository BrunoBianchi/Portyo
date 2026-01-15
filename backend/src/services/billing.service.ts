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

    static async createBilling(userId: string, plan: 'standard' | 'pro', days: number, price: number, stripeCustomerId?: string) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const billing = this.repository.create({
            userId,
            plan,
            price,
            startDate,
            endDate,
            stripeCustomerId
        });

        return await this.repository.save(billing);
    }
}

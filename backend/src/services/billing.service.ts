import { MoreThan, LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../database/datasource";
import { BillingEntity } from "../database/entity/billing-entity";

export class BillingService {
    private static repository = AppDataSource.getRepository(BillingEntity);

    /**
     * Checks the active plan for a user based on their billing history.
     * Returns "pro", "standard", or "free".
     */
    static async getActivePlan(userId: string): Promise<string> {
        const now = new Date();

        const activeBilling = await this.repository.findOne({
            where: {
                userId: userId,
                startDate: LessThanOrEqual(now),
                endDate: MoreThan(now)
            },
            order: {
                endDate: "DESC" // If multiple, take the one ending latest (or maybe we should prioritize 'pro' over 'standard'?)
            }
        });

        if (!activeBilling) {
            return "free";
        }

        return activeBilling.plan;
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

import { Router, Request, Response } from "express";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";
import { requireAuth } from "../../../middlewares/auth.middleware";
import Stripe from "stripe";
import { env } from "../../../config/env";

const router = Router();
const bioRepository = AppDataSource.getRepository(BioEntity);
const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover",
});

type SalesRangeInput = {
    days?: number;
    startDate?: string;
    endDate?: string;
};

function normalizeRange(input: SalesRangeInput) {
    const now = new Date();

    const parsedDays = Number(input.days);
    const safeDays = Number.isFinite(parsedDays) && parsedDays > 0
        ? Math.min(Math.floor(parsedDays), 365)
        : 30;

    let startDate: Date;
    let endDate: Date;

    if (input.startDate && input.endDate) {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        const validStart = !Number.isNaN(start.getTime());
        const validEnd = !Number.isNaN(end.getTime());

        if (validStart && validEnd && start <= end) {
            startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999);
        } else {
            endDate = now;
            startDate = new Date(now.getTime() - (safeDays - 1) * 24 * 60 * 60 * 1000);
            startDate.setHours(0, 0, 0, 0);
        }
    } else {
        endDate = now;
        startDate = new Date(now.getTime() - (safeDays - 1) * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
    }

    const rangeMs = endDate.getTime() - startDate.getTime();
    const previousEnd = new Date(startDate.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - rangeMs);

    return {
        now,
        currentStart: Math.floor(startDate.getTime() / 1000),
        currentEnd: Math.floor(endDate.getTime() / 1000),
        previousStart: Math.floor(previousStart.getTime() / 1000),
        previousEnd: Math.floor(previousEnd.getTime() / 1000),
        startDate,
        endDate,
    };
}

async function listChargesForRange(accountId: string, gte: number, lte: number) {
    const charges: Stripe.Charge[] = [];
    let startingAfter: string | undefined;

    while (charges.length < 1000) {
        const page = await stripe.charges.list(
            {
                created: { gte, lte },
                limit: 100,
                starting_after: startingAfter,
            },
            { stripeAccount: accountId }
        );

        charges.push(...page.data);

        if (!page.has_more || page.data.length === 0) {
            break;
        }

        startingAfter = page.data[page.data.length - 1].id;
    }

    return charges;
}

router.get(
    "/sales",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { bioId, days, startDate, endDate } = req.query;

            if (!bioId || typeof bioId !== "string") {
                throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
            }

            // Get bio with integrations
            const bio = await bioRepository.findOne({ 
                where: { id: bioId },
                relations: ["integrations", "user"]
            });

            if (!bio) {
                throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
            }

            // requireAuth already ensures req.user exists
            // Check ownership
            const userId = req.user?.id;
            if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);

            if (bio.userId !== userId) {
                throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
            }

            // Check if Stripe is connected
            const stripeIntegration = bio.integrations?.find(i => i.name === "stripe");

            if (!stripeIntegration || !stripeIntegration.account_id) {
                return res.json({
                    connected: false,
                    sales: { current: 0, lastMonth: 0, change: 0 },
                    revenue: { current: 0, lastMonth: 0, change: 0, currency: "USD" },
                    averageOrderValue: 0,
                    topProducts: [],
                    dailyRevenue: [],
                    recentTransactions: []
                });
            }

            try {
                const dates = normalizeRange({
                    days: typeof days === "string" ? Number(days) : undefined,
                    startDate: typeof startDate === "string" ? startDate : undefined,
                    endDate: typeof endDate === "string" ? endDate : undefined,
                });

                const allCharges = await listChargesForRange(
                    stripeIntegration.account_id,
                    dates.previousStart,
                    dates.currentEnd
                );

                const paidCharges = allCharges.filter(c => c.paid);
                const currentPeriodPaid = paidCharges.filter(
                    c => c.created >= dates.currentStart && c.created <= dates.currentEnd
                );
                const previousPeriodPaid = paidCharges.filter(
                    c => c.created >= dates.previousStart && c.created <= dates.previousEnd
                );

                // Basic metrics
                const currentSales = currentPeriodPaid.length;
                const currentRevenue = currentPeriodPaid.reduce((sum, c) => sum + c.amount, 0) / 100;
                const lastMonthSales = previousPeriodPaid.length;
                const lastMonthRevenue = previousPeriodPaid.reduce((sum, c) => sum + c.amount, 0) / 100;

                // Calculate changes
                const salesChange = lastMonthSales > 0
                    ? ((currentSales - lastMonthSales) / lastMonthSales) * 100
                    : currentSales > 0 ? 100 : 0;
                const revenueChange = lastMonthRevenue > 0
                    ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                    : currentRevenue > 0 ? 100 : 0;

                // Average Order Value
                const averageOrderValue = currentSales > 0 
                    ? Math.round((currentRevenue / currentSales) * 100) / 100 
                    : 0;

                // Currency
                const currency = allCharges[0]?.currency?.toUpperCase() || "USD";

                // Daily revenue for last 30 days (for chart)
                const dailyRevenueMap: { [key: string]: number } = {};
                const dayCount = Math.max(1, Math.ceil((dates.endDate.getTime() - dates.startDate.getTime() + 1) / (24 * 60 * 60 * 1000)));
                for (let i = 0; i < dayCount; i++) {
                    const date = new Date(dates.startDate);
                    date.setDate(date.getDate() + i);
                    const dateKey = date.toISOString().split('T')[0];
                    dailyRevenueMap[dateKey] = 0;
                }
                
                currentPeriodPaid.forEach(charge => {
                    const date = new Date(charge.created * 1000);
                    const dateKey = date.toISOString().split('T')[0];
                    if (dailyRevenueMap.hasOwnProperty(dateKey)) {
                        dailyRevenueMap[dateKey] += charge.amount / 100;
                    }
                });

                const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, amount]) => ({
                    date,
                    amount: Math.round(amount * 100) / 100
                }));

                // Top products by revenue
                const productRevenueMap: { [key: string]: { name: string; amount: number; count: number } } = {};
                currentPeriodPaid.forEach(charge => {
                    const productName = charge.description || "Product";
                    if (!productRevenueMap[productName]) {
                        productRevenueMap[productName] = { name: productName, amount: 0, count: 0 };
                    }
                    productRevenueMap[productName].amount += charge.amount / 100;
                    productRevenueMap[productName].count += 1;
                });

                const topProducts = Object.values(productRevenueMap)
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map(p => ({
                        name: p.name,
                        revenue: Math.round(p.amount * 100) / 100,
                        sales: p.count
                    }));

                // Recent transactions (last 10)
                const recentTransactions = currentPeriodPaid
                    .sort((a, b) => b.created - a.created)
                    .slice(0, 10)
                    .map(charge => ({
                        id: charge.id,
                        amount: charge.amount / 100,
                        currency: charge.currency.toUpperCase(),
                        description: charge.description || "Product",
                        date: new Date(charge.created * 1000).toISOString(),
                        status: charge.status
                    }));

                return res.json({
                    connected: true,
                    sales: {
                        current: currentSales,
                        lastMonth: lastMonthSales,
                        change: Math.round(salesChange * 10) / 10
                    },
                    revenue: {
                        current: Math.round(currentRevenue * 100) / 100,
                        lastMonth: Math.round(lastMonthRevenue * 100) / 100,
                        change: Math.round(revenueChange * 10) / 10,
                        currency
                    },
                    averageOrderValue,
                    topProducts,
                    dailyRevenue,
                    recentTransactions,
                    range: {
                        startDate: dates.startDate.toISOString(),
                        endDate: dates.endDate.toISOString(),
                    }
                });

            } catch (stripeError: any) {
                console.error("Stripe error:", stripeError);
                return res.json({
                    connected: true,
                    error: "Failed to fetch sales data from Stripe",
                    sales: { current: 0, lastMonth: 0, change: 0 },
                    revenue: { current: 0, lastMonth: 0, change: 0, currency: "USD" },
                    averageOrderValue: 0,
                    topProducts: [],
                    dailyRevenue: [],
                    recentTransactions: []
                });
            }

        } catch (error: any) {
            if (error instanceof ApiError) {
                return res.status(error.code).json({ error: error.message });
            }
            return res.status(500).json({ error: "Failed to fetch sales data" });
        }
    }
);

export default router;

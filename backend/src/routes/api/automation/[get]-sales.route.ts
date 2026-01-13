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

// Helper function to get date ranges
function getDateRanges() {
    const now = new Date();
    
    // Current month
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthStart = Math.floor(firstDayCurrentMonth.getTime() / 1000);
    const currentMonthEnd = Math.floor(now.getTime() / 1000);
    
    // Last month
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthStart = Math.floor(firstDayLastMonth.getTime() / 1000);
    const lastMonthEnd = Math.floor(lastDayLastMonth.getTime() / 1000);
    
    // Last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysStart = Math.floor(thirtyDaysAgo.getTime() / 1000);
    
    return {
        currentMonthStart,
        currentMonthEnd,
        lastMonthStart,
        lastMonthEnd,
        thirtyDaysStart,
        now
    };
}

router.get(
    "/sales",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { bioId } = req.query;

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
            if (!userId) {
                throw new ApiError(APIErrors.unauthorizedError, "User not authenticated", 401);
            }

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
                const dates = getDateRanges();

                // Fetch all charges for last 30 days for detailed analysis
                const allCharges = await stripe.charges.list({
                    created: { gte: dates.thirtyDaysStart },
                    limit: 100
                }, {
                    stripeAccount: stripeIntegration.account_id
                });

                // Fetch last month charges for comparison
                const lastMonthCharges = await stripe.charges.list({
                    created: {
                        gte: dates.lastMonthStart,
                        lte: dates.lastMonthEnd
                    },
                    limit: 100
                }, {
                    stripeAccount: stripeIntegration.account_id
                });

                // Filter paid charges for current month
                const currentMonthPaid = allCharges.data.filter(c => 
                    c.paid && c.created >= dates.currentMonthStart
                );
                const lastMonthPaid = lastMonthCharges.data.filter(c => c.paid);

                // Basic metrics
                const currentSales = currentMonthPaid.length;
                const currentRevenue = currentMonthPaid.reduce((sum, c) => sum + c.amount, 0) / 100;
                const lastMonthSales = lastMonthPaid.length;
                const lastMonthRevenue = lastMonthPaid.reduce((sum, c) => sum + c.amount, 0) / 100;

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
                const currency = allCharges.data[0]?.currency?.toUpperCase() || "USD";

                // Daily revenue for last 30 days (for chart)
                const dailyRevenueMap: { [key: string]: number } = {};
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(dates.now);
                    date.setDate(date.getDate() - i);
                    const dateKey = date.toISOString().split('T')[0];
                    dailyRevenueMap[dateKey] = 0;
                }
                
                allCharges.data.filter(c => c.paid).forEach(charge => {
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
                allCharges.data.filter(c => c.paid).forEach(charge => {
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
                const recentTransactions = allCharges.data
                    .filter(c => c.paid)
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
                    recentTransactions
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

import { Router, Request, Response } from "express";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ActivityEntity, ActivityType } from "../../../database/entity/activity-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { Between, LessThan, MoreThanOrEqual } from "typeorm";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";

const router = Router();
const bioRepository = AppDataSource.getRepository(BioEntity);
const activityRepository = AppDataSource.getRepository(ActivityEntity);

router.get(
    "/overview",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { bioId } = req.query;

            if (!bioId || typeof bioId !== "string") {
                throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
            }

            // Get current bio data
            const bio = await bioRepository.findOne({ 
                where: { id: bioId },
                relations: ["user"]
            });

            if (!bio) {
                throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
            }

            // requireAuth already ensures req.user exists
            const userId = req.user?.id;
            if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);

            if (bio.userId !== userId) {
                throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
            }

            // Calculate date ranges
            const now = new Date();
            const currentMonthStart = startOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = currentMonthStart; // End of last month is start of current

            // Helper to get count by type and date range
            const getCount = async (type: ActivityType, start: Date, end?: Date) => {
                const where: any = {
                    bioId,
                    type,
                    createdAt: end ? Between(start, end) : MoreThanOrEqual(start)
                };
                return await activityRepository.count({ where });
            };

            // Fetch Data Parallelly
            const [
                currentMonthViews,
                lastMonthViews,
                currentMonthClicks,
                lastMonthClicks
            ] = await Promise.all([
                getCount(ActivityType.VIEW, currentMonthStart),
                getCount(ActivityType.VIEW, lastMonthStart, lastMonthEnd),
                getCount(ActivityType.CLICK, currentMonthStart),
                getCount(ActivityType.CLICK, lastMonthStart, lastMonthEnd)
            ]);

            // Calculate Trends (Growth of Volume)
            const calculateGrowth = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            const viewsGrowth = calculateGrowth(currentMonthViews, lastMonthViews);
            const clicksGrowth = calculateGrowth(currentMonthClicks, lastMonthClicks);

            // Calculate CTR
            // Current Month CTR
            const currentCTR = currentMonthViews > 0 
                ? (currentMonthClicks / currentMonthViews) * 100 
                : 0;
            
            // Last Month CTR
            const lastMonthCTR = lastMonthViews > 0 
                ? (lastMonthClicks / lastMonthViews) * 100 
                : 0;

            const ctrGrowth = calculateGrowth(currentCTR, lastMonthCTR);

            // Lifetime CTR
            const totalViews = Number(bio.views) || 0;
            const totalClicks = Number(bio.clicks) || 0;
            const avgCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

            return res.json({
                views: {
                    total: totalViews,
                    currentMonth: currentMonthViews,
                    lastMonth: lastMonthViews,
                    change: Math.round(viewsGrowth * 10) / 10
                },
                clicks: {
                    total: totalClicks,
                    currentMonth: currentMonthClicks,
                    lastMonth: lastMonthClicks,
                    change: Math.round(clicksGrowth * 10) / 10
                },
                ctr: {
                    average: Math.round(avgCTR * 10) / 10,
                    currentMonth: Math.round(currentCTR * 10) / 10,
                    lastMonth: Math.round(lastMonthCTR * 10) / 10,
                    change: Math.round(ctrGrowth * 10) / 10
                }
            });
        } catch (error: any) {
            console.error("Analytics Error:", error);
            if (error instanceof ApiError) {
                return res.status(error.code).json({ error: error.message });
            }
            return res.status(500).json({ error: "Failed to fetch analytics data" });
        }
    }
);

export default router;

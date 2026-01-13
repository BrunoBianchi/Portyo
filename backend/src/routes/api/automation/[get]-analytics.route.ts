import { Router, Request, Response } from "express";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();
const bioRepository = AppDataSource.getRepository(BioEntity);

router.get(
    "/analytics",
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
            // Check ownership
            if (bio.userId !== req.user!.id) {
                throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
            }

            // For now, calculate mock "last month" data
            // In a real implementation, you would store historical data
            const currentViews = Number(bio.views) || 0;
            const currentClicks = Number(bio.clicks) || 0;
            
            // Mock: assume 15% growth from last month
            const lastMonthViews = Math.floor(currentViews / 1.15);
            const lastMonthClicks = Math.floor(currentClicks / 1.15);
            
            // Calculate CTR (Click-Through Rate)
            const currentCTR = currentViews > 0 ? (currentClicks / currentViews) * 100 : 0;
            const lastMonthCTR = lastMonthViews > 0 ? (lastMonthClicks / lastMonthViews) * 100 : 0;
            
            // Calculate percentage changes
            const viewsChange = lastMonthViews > 0 
                ? ((currentViews - lastMonthViews) / lastMonthViews) * 100 
                : currentViews > 0 ? 100 : 0;
                
            const clicksChange = lastMonthClicks > 0 
                ? ((currentClicks - lastMonthClicks) / lastMonthClicks) * 100 
                : currentClicks > 0 ? 100 : 0;
                
            const ctrChange = lastMonthCTR > 0 
                ? ((currentCTR - lastMonthCTR) / lastMonthCTR) * 100 
                : currentCTR > 0 ? 100 : 0;

            return res.json({
                views: {
                    current: currentViews,
                    lastMonth: lastMonthViews,
                    change: Math.round(viewsChange * 10) / 10 // Round to 1 decimal
                },
                clicks: {
                    current: currentClicks,
                    lastMonth: lastMonthClicks,
                    change: Math.round(clicksChange * 10) / 10
                },
                ctr: {
                    current: Math.round(currentCTR * 10) / 10, // Round to 1 decimal
                    lastMonth: Math.round(lastMonthCTR * 10) / 10,
                    change: Math.round(ctrChange * 10) / 10
                }
            });
        } catch (error: any) {
            if (error instanceof ApiError) {
                return res.status(error.code).json({ error: error.message });
            }
            return res.status(500).json({ error: "Failed to fetch analytics data" });
        }
    }
);

export default router;

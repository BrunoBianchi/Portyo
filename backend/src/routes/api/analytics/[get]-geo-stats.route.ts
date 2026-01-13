import { Router, Request, Response } from "express";
import { AppDataSource } from "../../../database/datasource";
import { PageViewEntity } from "../../../database/entity/page-view-entity";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();
const pageViewRepository = AppDataSource.getRepository(PageViewEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

// Country coordinates for map display
const countryCoordinates: { [key: string]: { lat: number; lng: number } } = {
    "US": { lat: 37.0902, lng: -95.7129 },
    "BR": { lat: -14.2350, lng: -51.9253 },
    "GB": { lat: 55.3781, lng: -3.4360 },
    "DE": { lat: 51.1657, lng: 10.4515 },
    "FR": { lat: 46.2276, lng: 2.2137 },
    "JP": { lat: 36.2048, lng: 138.2529 },
    "CN": { lat: 35.8617, lng: 104.1954 },
    "IN": { lat: 20.5937, lng: 78.9629 },
    "AU": { lat: -25.2744, lng: 133.7751 },
    "CA": { lat: 56.1304, lng: -106.3468 },
    "MX": { lat: 23.6345, lng: -102.5528 },
    "ES": { lat: 40.4637, lng: -3.7492 },
    "IT": { lat: 41.8719, lng: 12.5674 },
    "PT": { lat: 39.3999, lng: -8.2245 },
    "NL": { lat: 52.1326, lng: 5.2913 },
    "AR": { lat: -38.4161, lng: -63.6167 },
    "CL": { lat: -35.6751, lng: -71.5430 },
    "CO": { lat: 4.5709, lng: -74.2973 },
    "RU": { lat: 61.5240, lng: 105.3188 },
    "KR": { lat: 35.9078, lng: 127.7669 },
    "PL": { lat: 51.9194, lng: 19.1451 },
    "SE": { lat: 60.1282, lng: 18.6435 },
    "NO": { lat: 60.4720, lng: 8.4689 },
    "DK": { lat: 56.2639, lng: 9.5018 },
    "FI": { lat: 61.9241, lng: 25.7482 },
};

router.get(
    "/geo-stats",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { bioId } = req.query;

            if (!bioId || typeof bioId !== "string") {
                throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
            }

            // Verify bio exists and user owns it
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
                throw new ApiError(APIErrors.authorizationError, "Not authorized", 403);
            }

            // Get views grouped by country
            let countryStats: any[] = [];
            let recentViews: any[] = [];
            let totalViews = 0;

            try {
                countryStats = await pageViewRepository
                    .createQueryBuilder("pv")
                    .select("pv.country", "country")
                    .addSelect("COUNT(*)", "views")
                    .where("pv.bioId = :bioId", { bioId })
                    .andWhere("pv.country IS NOT NULL")
                    .groupBy("pv.country")
                    .orderBy("views", "DESC")
                    .limit(20)
                    .getRawMany();

                // Get recent views with coordinates for markers
                recentViews = await pageViewRepository
                    .createQueryBuilder("pv")
                    .select("pv.latitude", "lat")
                    .addSelect("pv.longitude", "lng")
                    .addSelect("pv.country", "country")
                    .addSelect("pv.city", "city")
                    .addSelect("pv.createdAt", "createdAt")
                    .where("pv.bioId = :bioId", { bioId })
                    .andWhere("pv.latitude IS NOT NULL")
                    .andWhere("pv.longitude IS NOT NULL")
                    .orderBy("pv.createdAt", "DESC")
                    .limit(50)
                    .getRawMany();

                // Get total views
                totalViews = await pageViewRepository.count({ where: { bioId } });
            } catch (dbError: any) {
                // If table doesn't exist or other DB error, return empty data
                console.warn("Geo stats DB query failed (table might not exist yet):", dbError.message);
            }

            const uniqueCountries = countryStats.length;

            // Format country stats with coordinates
            const countries = countryStats.map(stat => ({
                code: stat.country,
                views: parseInt(stat.views),
                coordinates: countryCoordinates[stat.country] || null
            }));

            // Calculate max views for heat map scaling
            const maxViews = countries.length > 0 ? Math.max(...countries.map(c => c.views)) : 0;

            // Format recent markers
            const markers = recentViews.map(view => ({
                lat: view.latitude,
                lng: view.longitude,
                country: view.country,
                city: view.city,
                timestamp: view.createdAt
            }));

            return res.json({
                totalViews,
                uniqueCountries,
                countries,
                markers,
                maxViews
            });
        } catch (error: any) {
            if (error instanceof ApiError) {
                return res.status(error.code).json({ error: error.message });
            }
            // Log the actual error for debugging
            console.error("Geo stats error:", error.message || error);
            return res.status(500).json({ 
                error: "Failed to fetch geo statistics",
                details: process.env.NODE_ENV !== 'production' ? error.message : undefined
            });
        }
    }
);

export default router;

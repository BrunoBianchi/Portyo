import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { AppDataSource } from "../../../database/datasource";
import { SiteAutoPostScheduleEntity } from "../../../database/entity/site-auto-post-schedule-entity";
import { SiteAutoPostLogEntity } from "../../../database/entity/site-auto-post-log-entity";
import { z } from "zod";
import { 
    createOrUpdateSiteSchedule,
    getSiteScheduleByUserId,
    toggleSiteScheduleStatus,
    deleteSiteSchedule,
    getSiteAutoPostStats,
    generateSitePostPreview,
} from "../../../services/site-auto-post.service";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

// Validation schemas
const scheduleSchema = z.object({
    frequency: z.enum(["5hours", "daily", "weekly", "biweekly", "monthly"]).optional(),
    topics: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    targetAudience: z.string().optional(),
    tone: z.string().optional(),
    postLength: z.enum(["short", "medium", "long"]).optional(),
    language: z.string().optional(),
    isActive: z.boolean().optional(),
    preferredTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    startDate: z.string().datetime().optional(),
    targetCountry: z.string().optional(),
    categories: z.array(z.string()).optional(),
    bilingual: z.boolean().optional(),
});

/**
 * GET /api/site-auto-post/schedule
 * Get user's site auto-post schedule
 */
router.get("/schedule", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const schedule = await getSiteScheduleByUserId(userId);
        
        res.json({
            success: true,
            schedule: schedule || null,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/site-auto-post/schedule
 * Create or update site auto-post schedule
 */
router.post("/schedule", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const config = scheduleSchema.parse(req.body);
        
        // Convert startDate string to Date if provided
        const parsedConfig: any = { ...config };
        if (config.startDate) {
            parsedConfig.startDate = new Date(config.startDate);
        }

        const schedule = await createOrUpdateSiteSchedule(userId, parsedConfig);

        res.json({
            success: true,
            message: schedule ? "Schedule updated successfully" : "Schedule created successfully",
            schedule,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/site-auto-post/schedule
 * Delete site auto-post schedule
 */
router.delete("/schedule", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const deleted = await deleteSiteSchedule(userId);

        res.json({
            success: true,
            message: deleted ? "Schedule deleted successfully" : "No schedule found to delete",
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/site-auto-post/toggle
 * Toggle schedule active status
 */
router.patch("/toggle", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);

        const schedule = await toggleSiteScheduleStatus(userId, isActive);

        res.json({
            success: true,
            message: `Schedule ${isActive ? "activated" : "deactivated"} successfully`,
            schedule,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/site-auto-post/stats
 * Get auto-post statistics
 */
router.get("/stats", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const stats = await getSiteAutoPostStats(userId);

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/site-auto-post/preview
 * Generate a preview post
 */
router.post("/preview", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const parsedBody = scheduleSchema.parse(req.body);
        
        // Convert parsed body to match Partial<SiteAutoPostScheduleEntity>
        const config: Partial<SiteAutoPostScheduleEntity> = {
            ...parsedBody,
            startDate: parsedBody.startDate ? new Date(parsedBody.startDate) : undefined,
        };
        
        const preview = await generateSitePostPreview(userId, config);

        res.json({
            success: true,
            preview,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/site-auto-post/logs
 * Get recent auto-post logs
 */
router.get("/logs", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const schedule = await getSiteScheduleByUserId(userId);
        
        if (!schedule) {
            res.json({
                success: true,
                logs: [],
            });
            return;
        }

        const logRepository = AppDataSource.getRepository(SiteAutoPostLogEntity);
        const logs = await logRepository.find({
            where: { scheduleId: schedule.id },
            order: { createdAt: "DESC" },
            take: 20,
        });

        res.json({
            success: true,
            logs,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

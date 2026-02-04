/**
 * Enhanced Site Auto Post Routes
 * Features: BAML Integration, Pillar Rotation, Engagement Config
 */

import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { AppDataSource } from "../../../database/datasource";
import { SiteAutoPostScheduleEntity, ContentPillar, EngagementGoal, ContentFormat, EmotionalTrigger, VoiceTrait } from "../../../database/entity/site-auto-post-schedule-entity";
import { SiteAutoPostLogEntity } from "../../../database/entity/site-auto-post-log-entity";
import { z } from "zod";
import { 
    createOrUpdateSiteSchedule,
    getSiteScheduleByUserId,
    toggleSiteScheduleStatus,
    deleteSiteSchedule,
    getSiteAutoPostStats,
} from "../../../services/site-auto-post.service";
import { 
    EnhancedAutoPostService,
    generateEnhancedSitePost,
} from "../../../services/site-auto-post-enhanced.service";
import { generateSiteContentSummary } from "../../../services/site-auto-post-ai.service";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

// Enhanced validation schemas with new fields
const scheduleSchema = z.object({
    // Existing fields
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
    
    // NEW: Content Pillar Configuration
    currentPillar: z.enum(["educational", "trend_analysis", "case_studies", "tools_tech", "strategy", "engagement"]).optional(),
    pillarRotation: z.array(z.string()).optional(),
    
    // NEW: Engagement Configuration
    engagementGoal: z.enum(["clicks", "shares", "comments", "conversions", "read_time"]).optional(),
    contentFormat: z.enum(["listicle", "how_to", "case_study", "comparison", "opinion", "news", "story", "data_study"]).optional(),
    emotionalTrigger: z.enum(["curiosity", "fear", "desire", "urgency", "belonging", "achievement"]).optional(),
    
    // NEW: Voice Configuration
    voiceTrait: z.enum(["authoritative", "friendly", "edgy", "professional", "casual", "inspirational"]).optional(),
    voiceHumorLevel: z.number().min(0).max(10).optional(),
    voiceFormality: z.number().min(0).max(10).optional(),
    voiceEnthusiasm: z.number().min(0).max(10).optional(),
    voiceUseEmoji: z.boolean().optional(),
    
    // NEW: Theme Management
    excludedThemes: z.array(z.string()).optional(),
    favoriteThemes: z.array(z.string()).optional(),
    
    // NEW: Quality Thresholds
    minEngagementScore: z.number().min(0).max(100).optional(),
    minSeoScore: z.number().min(0).max(100).optional(),
    minGeoScore: z.number().min(0).max(100).optional(),
    minAeoScore: z.number().min(0).max(100).optional(),
    
    // NEW: Variation Settings
    maxAngleVariations: z.number().min(1).max(10).optional(),
    autoOptimize: z.boolean().optional(),
});

const previewSchema = scheduleSchema.extend({
    forcePillar: z.enum(["educational", "trend_analysis", "case_studies", "tools_tech", "strategy", "engagement"]).optional(),
    forceTheme: z.string().optional(),
});

// ==================== ENHANCED ROUTES ====================

/**
 * GET /api/site-auto-post/enhanced/schedule
 * Get user's enhanced site auto-post schedule
 */
router.get("/enhanced/schedule", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const schedule = await getSiteScheduleByUserId(userId);
        
        // Calculate next pillar in rotation
        const nextPillar = schedule ? schedule.getNextPillar() : null;
        
        res.json({
            success: true,
            schedule: schedule || null,
            nextPillar,
            themeLibrary: {
                totalThemes: EnhancedAutoPostService.THEME_LIBRARY.length,
                themesByPillar: {
                    educational: EnhancedAutoPostService.THEME_LIBRARY.filter(t => t.pillar === "educational").length,
                    trend_analysis: EnhancedAutoPostService.THEME_LIBRARY.filter(t => t.pillar === "trend_analysis").length,
                    case_studies: EnhancedAutoPostService.THEME_LIBRARY.filter(t => t.pillar === "case_studies").length,
                    tools_tech: EnhancedAutoPostService.THEME_LIBRARY.filter(t => t.pillar === "tools_tech").length,
                    strategy: EnhancedAutoPostService.THEME_LIBRARY.filter(t => t.pillar === "strategy").length,
                    engagement: EnhancedAutoPostService.THEME_LIBRARY.filter(t => t.pillar === "engagement").length,
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/site-auto-post/enhanced/schedule
 * Create or update enhanced site auto-post schedule
 */
router.post("/enhanced/schedule", authMiddleware, isUserPro, async (req, res, next) => {
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
 * POST /api/site-auto-post/enhanced/preview
 * Generate an enhanced preview post with BAML integration
 */
router.post("/enhanced/preview", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const parsedBody = previewSchema.parse(req.body);
        
        // Get or create schedule
        let schedule = await getSiteScheduleByUserId(userId);
        
        if (!schedule) {
            // Create temporary schedule for preview
            const tempSchedule = new SiteAutoPostScheduleEntity();
            tempSchedule.userId = userId;
            tempSchedule.frequency = parsedBody.frequency || "daily";
            tempSchedule.topics = parsedBody.topics || null;
            tempSchedule.keywords = parsedBody.keywords || null;
            tempSchedule.targetAudience = parsedBody.targetAudience || null;
            tempSchedule.tone = parsedBody.tone || "professional";
            tempSchedule.postLength = parsedBody.postLength || "medium";
            tempSchedule.language = parsedBody.language || "pt";
            tempSchedule.bilingual = parsedBody.bilingual !== undefined ? parsedBody.bilingual : true;
            tempSchedule.currentPillar = parsedBody.forcePillar || parsedBody.currentPillar || "educational";
            tempSchedule.engagementGoal = parsedBody.engagementGoal || "conversions";
            tempSchedule.contentFormat = parsedBody.contentFormat || "how_to";
            tempSchedule.emotionalTrigger = parsedBody.emotionalTrigger || "desire";
            tempSchedule.voiceTrait = parsedBody.voiceTrait || "professional";
            tempSchedule.voiceHumorLevel = parsedBody.voiceHumorLevel || 3;
            tempSchedule.voiceFormality = parsedBody.voiceFormality || 6;
            tempSchedule.voiceEnthusiasm = parsedBody.voiceEnthusiasm || 7;
            tempSchedule.voiceUseEmoji = parsedBody.voiceUseEmoji !== undefined ? parsedBody.voiceUseEmoji : true;
            tempSchedule.excludedThemes = parsedBody.excludedThemes || null;
            tempSchedule.favoriteThemes = parsedBody.favoriteThemes || null;
            tempSchedule.minEngagementScore = parsedBody.minEngagementScore || 75;
            tempSchedule.minSeoScore = parsedBody.minSeoScore || 70;
            tempSchedule.minGeoScore = parsedBody.minGeoScore || 70;
            tempSchedule.minAeoScore = parsedBody.minAeoScore || 70;
            tempSchedule.maxAngleVariations = parsedBody.maxAngleVariations || 3;
            tempSchedule.autoOptimize = parsedBody.autoOptimize !== undefined ? parsedBody.autoOptimize : true;
            schedule = tempSchedule;
        }

        // Override with preview-specific settings
        if (parsedBody.forcePillar) {
            schedule.currentPillar = parsedBody.forcePillar;
        }

        // Generate content summary
        const contentSummary = await generateSiteContentSummary(
            schedule.topics || "",
            schedule.targetAudience,
            schedule.tone
        );

        // Generate enhanced post
        const preview = await generateEnhancedSitePost(schedule, contentSummary);

        if (!preview) {
            throw new ApiError(APIErrors.internalServerError, "Failed to generate preview", 500);
        }

        res.json({
            success: true,
            preview: {
                ...preview,
                // Add metadata for UI
                metadata: {
                    pillar: preview.pillar,
                    themeId: preview.themeId,
                    angle: preview.angle,
                    contentHash: preview.contentHash,
                    qualityChecks: {
                        seo: preview.seoScore >= (schedule.minSeoScore || 70),
                        geo: preview.geoScore >= (schedule.minGeoScore || 70),
                        aeo: preview.aeoScore >= (schedule.minAeoScore || 70),
                        engagement: preview.engagementScore >= (schedule.minEngagementScore || 75),
                    }
                }
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/site-auto-post/enhanced/content-history
 * Get content generation history (anti-repetition)
 */
router.get("/enhanced/content-history", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const schedule = await getSiteScheduleByUserId(userId);
        
        if (!schedule) {
            res.json({
                success: true,
                history: [],
                totalGenerated: 0,
            });
            return;
        }

        const history = schedule.getContentHistory();

        res.json({
            success: true,
            history: history.slice(-50), // Last 50 entries
            totalGenerated: history.length,
            uniqueThemes: new Set(history.map(h => h.themeId)).size,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/site-auto-post/enhanced/theme-library
 * Get all available themes grouped by pillar
 */
router.get("/enhanced/theme-library", authMiddleware, async (req, res, next) => {
    try {
        const { pillar } = req.query;
        
        let themes = EnhancedAutoPostService.THEME_LIBRARY;
        
        // Filter by pillar if provided
        if (pillar && typeof pillar === "string") {
            themes = themes.filter(t => t.pillar === pillar);
        }

        // Group by pillar
        const grouped = themes.reduce((acc, theme) => {
            if (!acc[theme.pillar]) {
                acc[theme.pillar] = [];
            }
            acc[theme.pillar].push({
                id: theme.id,
                title: theme.title,
                angles: theme.angles,
                keywords: theme.keywords,
                difficulty: theme.difficulty,
                readTime: theme.readTime,
                evergreen: theme.evergreen,
            });
            return acc;
        }, {} as Record<string, any[]>);

        res.json({
            success: true,
            themes: grouped,
            total: themes.length,
            summary: {
                educational: grouped["educational"]?.length || 0,
                trend_analysis: grouped["trend_analysis"]?.length || 0,
                case_studies: grouped["case_studies"]?.length || 0,
                tools_tech: grouped["tools_tech"]?.length || 0,
                strategy: grouped["strategy"]?.length || 0,
                engagement: grouped["engagement"]?.length || 0,
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/site-auto-post/enhanced/rotate-pillar
 * Manually rotate to next pillar
 */
router.post("/enhanced/rotate-pillar", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const schedule = await getSiteScheduleByUserId(userId);
        
        if (!schedule) {
            throw new ApiError(APIErrors.notFoundError, "Schedule not found", 404);
        }

        const oldPillar = schedule.currentPillar;
        const updatedSchedule = await EnhancedAutoPostService.rotatePillar(schedule);

        res.json({
            success: true,
            message: "Pillar rotated successfully",
            rotation: {
                from: oldPillar,
                to: updatedSchedule.currentPillar,
            },
            schedule: updatedSchedule,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/site-auto-post/enhanced/engagement-config
 * Get engagement configuration options
 */
router.get("/enhanced/engagement-config", authMiddleware, async (req, res, next) => {
    try {
        res.json({
            success: true,
            config: {
                goals: [
                    { value: "clicks", label: "Clicks", description: "Optimize for link clicks", recommendedFormat: "how_to" },
                    { value: "shares", label: "Shares", description: "Optimize for social sharing", recommendedFormat: "listicle" },
                    { value: "comments", label: "Comments", description: "Optimize for engagement", recommendedFormat: "opinion" },
                    { value: "conversions", label: "Conversions", description: "Optimize for sales/signups", recommendedFormat: "case_study" },
                    { value: "read_time", label: "Read Time", description: "Optimize for content consumption", recommendedFormat: "story" },
                ],
                formats: [
                    { value: "listicle", label: "Listicle", description: "Numbered lists (e.g., '10 Ways to...')" },
                    { value: "how_to", label: "How-To Guide", description: "Step-by-step tutorials" },
                    { value: "case_study", label: "Case Study", description: "Real-world examples and results" },
                    { value: "comparison", label: "Comparison", description: "Side-by-side comparisons" },
                    { value: "opinion", label: "Opinion", description: "Thought leadership pieces" },
                    { value: "news", label: "News", description: "Industry news and updates" },
                    { value: "story", label: "Story", description: "Narrative-driven content" },
                    { value: "data_study", label: "Data Study", description: "Research and data analysis" },
                ],
                emotionalTriggers: [
                    { value: "curiosity", label: "Curiosity", description: "Pique reader interest" },
                    { value: "fear", label: "Fear", description: "Address pain points and risks" },
                    { value: "desire", label: "Desire", description: "Create aspiration and want" },
                    { value: "urgency", label: "Urgency", description: "Time-sensitive motivation" },
                    { value: "belonging", label: "Belonging", description: "Community and inclusion" },
                    { value: "achievement", label: "Achievement", description: "Success and accomplishment" },
                ],
                voiceTraits: [
                    { value: "authoritative", label: "Authoritative", description: "Expert and commanding" },
                    { value: "friendly", label: "Friendly", description: "Warm and approachable" },
                    { value: "edgy", label: "Edgy", description: "Bold and provocative" },
                    { value: "professional", label: "Professional", description: "Polished and business-like" },
                    { value: "casual", label: "Casual", description: "Relaxed and conversational" },
                    { value: "inspirational", label: "Inspirational", description: "Motivating and uplifting" },
                ],
                pillars: [
                    { value: "educational", label: "Educational", description: "Tutorials, guides, how-tos", color: "#3B82F6" },
                    { value: "trend_analysis", label: "Trend Analysis", description: "Industry trends and predictions", color: "#8B5CF6" },
                    { value: "case_studies", label: "Case Studies", description: "Success stories and examples", color: "#10B981" },
                    { value: "tools_tech", label: "Tools & Tech", description: "Software and tool reviews", color: "#F59E0B" },
                    { value: "strategy", label: "Strategy", description: "Advanced tactics and frameworks", color: "#EF4444" },
                    { value: "engagement", label: "Engagement", description: "Viral and engagement tactics", color: "#EC4899" },
                ],
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/site-auto-post/enhanced/exclude-theme
 * Exclude a theme from rotation
 */
router.post("/enhanced/exclude-theme", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const { themeId } = z.object({ themeId: z.string() }).parse(req.body);

        const scheduleRepository = AppDataSource.getRepository(SiteAutoPostScheduleEntity);
        let schedule = await scheduleRepository.findOne({ where: { userId } });

        if (!schedule) {
            throw new ApiError(APIErrors.notFoundError, "Schedule not found", 404);
        }

        // Add to excluded themes
        const excluded = schedule.excludedThemes || [];
        if (!excluded.includes(themeId)) {
            excluded.push(themeId);
            schedule.excludedThemes = excluded;
            await scheduleRepository.save(schedule);
        }

        res.json({
            success: true,
            message: "Theme excluded successfully",
            excludedThemes: schedule.excludedThemes,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/site-auto-post/enhanced/favorite-theme
 * Mark a theme as favorite
 */
router.post("/enhanced/favorite-theme", authMiddleware, isUserPro, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Unauthorized", 401);

        const { themeId } = z.object({ themeId: z.string() }).parse(req.body);

        const scheduleRepository = AppDataSource.getRepository(SiteAutoPostScheduleEntity);
        let schedule = await scheduleRepository.findOne({ where: { userId } });

        if (!schedule) {
            throw new ApiError(APIErrors.notFoundError, "Schedule not found", 404);
        }

        // Add to favorite themes
        const favorites = schedule.favoriteThemes || [];
        if (!favorites.includes(themeId)) {
            favorites.push(themeId);
            schedule.favoriteThemes = favorites;
            await scheduleRepository.save(schedule);
        }

        res.json({
            success: true,
            message: "Theme added to favorites",
            favoriteThemes: schedule.favoriteThemes,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

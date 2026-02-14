import { AppDataSource } from "../database/datasource";
import { SiteAutoPostScheduleEntity, SitePostFrequency } from "../database/entity/site-auto-post-schedule-entity";
import { SiteAutoPostLogEntity } from "../database/entity/site-auto-post-log-entity";
import { SitePostEntity } from "../database/entity/site-post-entity";
import { UserEntity } from "../database/entity/user-entity";
import { 
    generateSiteContentSummary, 
    generateSiteAutoPost, 
    SiteContentSummary,
    generateSitePostPreviewWithTOON,
} from "./site-auto-post-ai-zai.service";
import { logger } from "../shared/utils/logger";
import { LessThan, IsNull, In, MoreThan } from "typeorm";
import { notificationService } from "./notification.service";
import { NotificationType } from "../database/entity/notification-entity";
import redisClient from "../config/redis.client";

const MAX_POSTS_PER_MONTH = 20; // Higher limit for site blog
const SITE_AUTO_POST_QUEUE_KEY = "site-auto-post:queue";
const SITE_AUTO_POST_DELAY_MS = 12 * 60 * 1000; // 12 minutes between posts
const SITE_AUTO_POST_QUEUE_BATCH = 5;

const scheduleRepository = AppDataSource.getRepository(SiteAutoPostScheduleEntity);
const logRepository = AppDataSource.getRepository(SiteAutoPostLogEntity);
const postRepository = AppDataSource.getRepository(SitePostEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * Calculate next post date based on frequency
 */
export const calculateNextSitePostDate = (
    frequency: SitePostFrequency,
    fromDate: Date = new Date(),
    preferredTime: string = "09:00",
    lastPostDate: Date | null = null
): Date => {
    const [hours, minutes] = preferredTime.split(":").map(Number);
    const nextDate = new Date(fromDate);
    nextDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, start from tomorrow
    if (nextDate <= fromDate) {
        nextDate.setDate(nextDate.getDate() + 1);
    }

    switch (frequency) {
        case "5hours":
            // Every 5 hours from now
            nextDate.setTime(fromDate.getTime() + (5 * 60 * 60 * 1000));
            break;
        case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case "biweekly":
            nextDate.setDate(nextDate.getDate() + 14);
            break;
        case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        default:
            nextDate.setTime(fromDate.getTime() + (5 * 60 * 60 * 1000));
    }

    return nextDate;
};

/**
 * Get current month in YYYY-MM format
 */
const getCurrentMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * Check and reset monthly counter if needed
 */
const checkAndResetMonthlyCounter = async (
    schedule: SiteAutoPostScheduleEntity
): Promise<SiteAutoPostScheduleEntity> => {
    const currentMonth = getCurrentMonth();
    
    if (schedule.currentMonth !== currentMonth) {
        schedule.currentMonth = currentMonth;
        schedule.postsThisMonth = 0;
        return await scheduleRepository.save(schedule);
    }
    
    return schedule;
};

/**
 * Check if schedule should run
 */
const shouldScheduleRun = (schedule: SiteAutoPostScheduleEntity): boolean => {
    if (!schedule.isActive) return false;
    if (schedule.startDate && new Date() < schedule.startDate) return false;
    return true;
};

/**
 * Create or update site auto post schedule
 */
export const createOrUpdateSiteSchedule = async (
    userId: string,
    config: Partial<SiteAutoPostScheduleEntity>
): Promise<SiteAutoPostScheduleEntity> => {
    let schedule = await scheduleRepository.findOne({
        where: { userId },
    });

    if (schedule) {
        // Update existing
        schedule.frequency = config.frequency || schedule.frequency;
        schedule.topics = config.topics ?? schedule.topics;
        schedule.keywords = config.keywords ?? schedule.keywords;
        schedule.targetAudience = config.targetAudience ?? schedule.targetAudience;
        schedule.tone = config.tone || schedule.tone;
        schedule.postLength = config.postLength || schedule.postLength;
        schedule.language = config.language ?? schedule.language;
        schedule.isActive = config.isActive !== undefined ? config.isActive : schedule.isActive;
        schedule.preferredTime = config.preferredTime ?? schedule.preferredTime;
        schedule.startDate = config.startDate ?? schedule.startDate;
        schedule.targetCountry = config.targetCountry ?? schedule.targetCountry;
        schedule.categories = config.categories ?? schedule.categories;
        schedule.bilingual = config.bilingual !== undefined ? config.bilingual : schedule.bilingual;

        // Recalculate next post date if needed
        if (config.frequency || config.isActive) {
            schedule.nextPostDate = calculateNextSitePostDate(
                schedule.frequency,
                new Date(),
                schedule.preferredTime,
                schedule.lastPostDate
            );
        }

        return await scheduleRepository.save(schedule);
    } else {
        // Create new schedule
        const newSchedule = scheduleRepository.create({
            userId,
            frequency: config.frequency || "5hours",
            topics: config.topics || null,
            keywords: config.keywords || null,
            targetAudience: config.targetAudience || null,
            tone: config.tone || "professional",
            postLength: config.postLength || "medium",
            language: config.language || "pt",
            isActive: config.isActive !== undefined ? config.isActive : true,
            preferredTime: config.preferredTime || "09:00",
            startDate: config.startDate || null,
            targetCountry: config.targetCountry || null,
            categories: config.categories || null,
            bilingual: config.bilingual !== undefined ? config.bilingual : true,
            nextPostDate: calculateNextSitePostDate(
                config.frequency || "5hours",
                new Date(),
                config.preferredTime || "09:00",
                null
            ),
            postsThisMonth: 0,
            currentMonth: getCurrentMonth(),
        });

        return await scheduleRepository.save(newSchedule);
    }
};

/**
 * Get schedule by user ID
 */
export const getSiteScheduleByUserId = async (
    userId: string
): Promise<SiteAutoPostScheduleEntity | null> => {
    return await scheduleRepository.findOne({
        where: { userId },
        relations: ["logs"],
    });
};

/**
 * Toggle schedule active status
 */
export const toggleSiteScheduleStatus = async (
    userId: string,
    isActive: boolean
): Promise<SiteAutoPostScheduleEntity | null> => {
    const schedule = await scheduleRepository.findOne({ where: { userId } });
    if (!schedule) return null;

    schedule.isActive = isActive;
    if (isActive && !schedule.nextPostDate) {
        schedule.nextPostDate = calculateNextSitePostDate(
            schedule.frequency,
            new Date(),
            schedule.preferredTime,
            schedule.lastPostDate
        );
    }

    return await scheduleRepository.save(schedule);
};

/**
 * Delete schedule
 */
export const deleteSiteSchedule = async (userId: string): Promise<boolean> => {
    const result = await scheduleRepository.delete({ userId });
    return result.affected ? result.affected > 0 : false;
};

/**
 * Generate content summary
 */
export const generateAndSaveContentSummary = async (
    schedule: SiteAutoPostScheduleEntity
): Promise<SiteContentSummary> => {
    const summary = await generateSiteContentSummary(
        schedule.topics || "",
        schedule.targetAudience,
        schedule.tone
    );

    schedule.contentSummary = summary.summary;
    schedule.contentSummaryGeneratedAt = new Date();
    await scheduleRepository.save(schedule);

    return summary;
};

/**
 * Process a single schedule and create post
 */
export const processSiteSchedule = async (schedule: SiteAutoPostScheduleEntity): Promise<void> => {
    try {
        logger.info(`[SiteAutoPost] Processing schedule ${schedule.id} for user ${schedule.userId}`);

        if (!shouldScheduleRun(schedule)) {
            logger.info(`[SiteAutoPost] Schedule ${schedule.id} not ready to run`);
            return;
        }

        schedule = await checkAndResetMonthlyCounter(schedule);

        if (schedule.postsThisMonth >= MAX_POSTS_PER_MONTH) {
            logger.info(`[SiteAutoPost] Schedule ${schedule.id} reached monthly limit`);
            return;
        }

        if (schedule.nextPostDate && new Date() < schedule.nextPostDate) {
            logger.info(`[SiteAutoPost] Schedule ${schedule.id} not ready for posting yet`);
            return;
        }

        // Get content summary
        let contentSummary: SiteContentSummary;
        if (schedule.contentSummary && schedule.contentSummaryGeneratedAt) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (schedule.contentSummaryGeneratedAt > thirtyDaysAgo) {
                contentSummary = {
                    summary: schedule.contentSummary,
                    industry: "General",
                    expertise: schedule.keywords || [],
                    tone: schedule.tone || "professional",
                    targetAudience: schedule.targetAudience || "General audience",
                    contentPillars: [],
                };
            } else {
                contentSummary = await generateAndSaveContentSummary(schedule);
            }
        } else {
            contentSummary = await generateAndSaveContentSummary(schedule);
        }

        // Get previous suggestions
        const previousLog = await logRepository.findOne({
            where: { scheduleId: schedule.id },
            order: { createdAt: "DESC" },
        });

        const previousSuggestions = previousLog ? {
            seo: previousLog.improvementSuggestions || [],
            geo: [],
            aeo: [],
        } : null;

        // Generate post using Z.AI (GLM 4.7) with fallback to Groq
        logger.info(`[SiteAutoPost] Generating post for schedule ${schedule.id}`);
        const generatedPost = await generateSiteAutoPost(schedule, contentSummary, previousSuggestions);
        
        logger.info(`[SiteAutoPost] Post generated via ${generatedPost.provider || "unknown"} in ${generatedPost.processingTimeMs || 0}ms`);

        // Create the post
        const post = postRepository.create({
            title: generatedPost.title,
            titleEn: generatedPost.titleEn,
            titlePt: schedule.language === "pt" ? generatedPost.title : generatedPost.titleEn,
            content: generatedPost.content,
            contentEn: generatedPost.contentEn,
            contentPt: schedule.language === "pt" ? generatedPost.content : generatedPost.contentEn,
            keywords: generatedPost.keywords,
            keywordsEn: generatedPost.keywordsEn,
            keywordsPt: schedule.language === "pt" ? generatedPost.keywords : generatedPost.keywordsEn,
            status: "published",
            thumbnail: null,
            scheduledAt: new Date(),
            language: schedule.language || "pt",
            user: { id: schedule.userId } as UserEntity,
        });

        const savedPost = await postRepository.save(post);

        // Create log
        const log = logRepository.create({
            scheduleId: schedule.id,
            postId: savedPost.id,
            status: "published",
            generatedTitle: generatedPost.title,
            generatedContent: generatedPost.content.substring(0, 500) + "...",
            generatedKeywords: generatedPost.keywords,
            generatedTitleEn: generatedPost.titleEn,
            generatedContentEn: generatedPost.contentEn,
            generatedKeywordsEn: generatedPost.keywordsEn,
            seoScore: generatedPost.seoScore,
            titleOptimizationScore: generatedPost.seoMetrics.titleOptimizationScore,
            metaDescriptionScore: generatedPost.seoMetrics.metaDescriptionScore,
            contentStructureScore: generatedPost.seoMetrics.contentStructureScore,
            keywordDensityScore: generatedPost.seoMetrics.keywordDensityScore,
            readabilityScore: generatedPost.seoMetrics.readabilityScore,
            geoScore: generatedPost.geoScore,
            entityRecognitionScore: generatedPost.geoMetrics.entityRecognitionScore,
            answerOptimizationScore: generatedPost.geoMetrics.answerOptimizationScore,
            structuredDataScore: generatedPost.geoMetrics.structuredDataScore,
            authoritySignalsScore: generatedPost.geoMetrics.authoritySignalsScore,
            aeoScore: generatedPost.aeoScore,
            answerRelevanceScore: generatedPost.aeoMetrics.answerRelevanceScore,
            directAnswerScore: generatedPost.aeoMetrics.directAnswerScore,
            questionOptimizationScore: generatedPost.aeoMetrics.questionOptimizationScore,
            voiceSearchScore: generatedPost.aeoMetrics.voiceSearchScore,
            originalityScore: generatedPost.contentQualityMetrics.originalityScore,
            engagementPotentialScore: generatedPost.contentQualityMetrics.engagementPotentialScore,
            metaDescription: generatedPost.metaDescription,
            slug: generatedPost.slug,
            titleLength: generatedPost.titleLength,
            metaDescriptionLength: generatedPost.metaDescriptionLength,
            wordCount: generatedPost.wordCount,
            improvementSuggestions: generatedPost.improvementSuggestions,
            aiProvider: generatedPost.provider || "zai",
            processingTimeMs: generatedPost.processingTimeMs || 0,
        });
        await logRepository.save(log);

        // Send notification
        await notificationService.createNotification({
            userId: schedule.userId,
            title: "Post automático publicado ✅",
            message: `Seu post "${generatedPost.title}" foi publicado no site blog.`,
            type: NotificationType.UPDATE,
            icon: "Sparkles",
            link: "/dashboard/site-blog",
            metadata: {
                postId: savedPost.id,
            },
        });

        // Update schedule
        schedule.lastPostDate = new Date();
        schedule.nextPostDate = calculateNextSitePostDate(
            schedule.frequency,
            new Date(),
            schedule.preferredTime,
            schedule.lastPostDate
        );
        schedule.postsThisMonth += 1;
        await scheduleRepository.save(schedule);

        logger.info(`[SiteAutoPost] Successfully created post ${savedPost.id} for schedule ${schedule.id}`);

    } catch (error: any) {
        logger.error(`[SiteAutoPost] Error processing schedule ${schedule.id}: ${error.message}`);

        // Create error log
        const log = logRepository.create({
            scheduleId: schedule.id,
            postId: null,
            status: "failed",
            errorMessage: error.message,
            generatedTitle: "Failed to generate",
            generatedContent: "",
            generatedKeywords: "",
        });
        await logRepository.save(log);

        // Keep retry cadence aligned with the configured schedule frequency
        schedule.nextPostDate = calculateNextSitePostDate(
            schedule.frequency || "5hours",
            new Date(),
            schedule.preferredTime,
            schedule.lastPostDate
        );
        await scheduleRepository.save(schedule);
    }
};

/**
 * Check if a schedule is "overdue" (should have been posted earlier)
 * Overdue = nextPostDate is in the past by more than a small buffer
 */
const isScheduleOverdue = (schedule: SiteAutoPostScheduleEntity): boolean => {
    if (!schedule.nextPostDate) return false;
    const now = new Date();
    const nextPost = new Date(schedule.nextPostDate);
    // Consider overdue if it was scheduled more than 5 minutes ago
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    return nextPost.getTime() < (now.getTime() - bufferMs);
};

/**
 * Run the auto-post job - called by cron
 * Handles both regular scheduled posts and "catch-up" for overdue posts
 */
export const runSiteAutoPostJob = async (): Promise<void> => {
    logger.info("[SiteAutoPost] Starting site auto-post job");

    try {
        const now = new Date();

        const staleCutoff = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        const staleFiveHourSchedules = await scheduleRepository.find({
            where: [
                {
                    isActive: true,
                    frequency: "5hours",
                    startDate: IsNull(),
                    nextPostDate: MoreThan(staleCutoff),
                },
                {
                    isActive: true,
                    frequency: "5hours",
                    startDate: LessThan(now),
                    nextPostDate: MoreThan(staleCutoff),
                },
            ],
        });

        if (staleFiveHourSchedules.length > 0) {
            logger.warn(`[SiteAutoPost] Repairing ${staleFiveHourSchedules.length} stale 5-hour schedule(s)`);
            for (const schedule of staleFiveHourSchedules) {
                schedule.nextPostDate = calculateNextSitePostDate(
                    "5hours",
                    now,
                    schedule.preferredTime,
                    schedule.lastPostDate
                );
                await scheduleRepository.save(schedule);
            }
        }
        
        const schedules = await scheduleRepository.find({
            where: [
                { isActive: true, nextPostDate: LessThan(now) },
                { isActive: true, nextPostDate: IsNull() },
            ],
        });

        const eligibleSchedules = schedules.filter(s => shouldScheduleRun(s));
        
        // Separate overdue schedules from on-time schedules
        const overdueSchedules = eligibleSchedules.filter(isScheduleOverdue);
        const onTimeSchedules = eligibleSchedules.filter(s => !isScheduleOverdue(s));

        logger.info(`[SiteAutoPost] Found ${eligibleSchedules.length} eligible schedules (${overdueSchedules.length} overdue, ${onTimeSchedules.length} on-time)`);

        // Process overdue schedules immediately (they should have been posted earlier)
        if (overdueSchedules.length > 0) {
            logger.info(`[SiteAutoPost] Processing ${overdueSchedules.length} overdue schedules immediately`);
            for (const schedule of overdueSchedules) {
                try {
                    // Process immediately, don't wait for queue
                    await processSiteSchedule(schedule);
                    logger.info(`[SiteAutoPost] Processed overdue schedule ${schedule.id}`);
                } catch (error: any) {
                    logger.error(`[SiteAutoPost] Failed to process overdue schedule ${schedule.id}: ${error.message}`);
                }
            }
        }

        // Enqueue on-time schedules with normal spacing
        if (onTimeSchedules.length > 0) {
            await enqueueSiteAutoPostSchedules(onTimeSchedules);
        }

        logger.info("[SiteAutoPost] Auto-post job completed");
    } catch (error: any) {
        logger.error(`[SiteAutoPost] Error in auto-post job: ${error.message}`);
    }
};

/**
 * Enqueue schedules into Redis
 */
export const enqueueSiteAutoPostSchedules = async (
    schedules: SiteAutoPostScheduleEntity[]
): Promise<void> => {
    if (!schedules.length) return;

    const now = Date.now();
    const sorted = [...schedules].sort((a, b) => {
        const aTime = a.nextPostDate ? new Date(a.nextPostDate).getTime() : now;
        const bTime = b.nextPostDate ? new Date(b.nextPostDate).getTime() : now;
        return aTime - bTime;
    });

    let enqueuedCount = 0;

    for (let index = 0; index < sorted.length; index++) {
        const schedule = sorted[index];
        const executeAt = now + index * SITE_AUTO_POST_DELAY_MS;

        try {
            const added = await redisClient.zadd(
                SITE_AUTO_POST_QUEUE_KEY,
                "NX",
                executeAt,
                schedule.id
            );
            if (added) enqueuedCount++;
        } catch (error: any) {
            logger.error(`[SiteAutoPost] Failed to enqueue schedule ${schedule.id}: ${error.message}`);
        }
    }

    logger.info(`[SiteAutoPost] Enqueued ${enqueuedCount} schedules`);
};

/**
 * Process due schedules from Redis queue
 */
export const processSiteAutoPostQueue = async (): Promise<void> => {
    try {
        const now = Date.now();

        const dueIds: string[] = await redisClient.zrangebyscore(
            SITE_AUTO_POST_QUEUE_KEY,
            0,
            now,
            "LIMIT",
            0,
            SITE_AUTO_POST_QUEUE_BATCH
        );

        if (!dueIds.length) return;

        const claimedIds: string[] = [];
        for (const scheduleId of dueIds) {
            const removed = await redisClient.zrem(SITE_AUTO_POST_QUEUE_KEY, scheduleId);
            if (removed) claimedIds.push(scheduleId);
        }

        if (!claimedIds.length) return;

        const schedules = await scheduleRepository.find({
            where: { id: In(claimedIds) },
        });

        const schedulesById = new Map(schedules.map(s => [s.id, s]));

        await Promise.all(
            claimedIds.map(async (scheduleId) => {
                const schedule = schedulesById.get(scheduleId);
                if (!schedule) {
                    logger.warn(`[SiteAutoPost] Schedule ${scheduleId} not found`);
                    return;
                }
                await processSiteSchedule(schedule);
            })
        );
    } catch (error: any) {
        logger.error(`[SiteAutoPost] Error processing queue: ${error.message}`);
    }
};

/**
 * Get auto-post statistics
 */
export const getSiteAutoPostStats = async (userId: string) => {
    const schedule = await scheduleRepository.findOne({ where: { userId } });

    if (!schedule) {
        return {
            schedule: null,
            postsThisMonth: 0,
            remainingPosts: MAX_POSTS_PER_MONTH,
            nextPostDate: null,
            lastPostDate: null,
            recentLogs: [],
            averageScores: {
                avgSeoScore: 0,
                avgGeoScore: 0,
                avgAeoScore: 0,
            },
        };
    }

    const updatedSchedule = await checkAndResetMonthlyCounter(schedule);

    const recentLogs = await logRepository.find({
        where: { scheduleId: schedule.id },
        order: { createdAt: "DESC" },
        take: 10,
    });

    const successfulLogs = recentLogs.filter(l => l.status === "published" && l.seoScore);
    const avgSeoScore = successfulLogs.length 
        ? Math.round(successfulLogs.reduce((s, l) => s + (l.seoScore || 0), 0) / successfulLogs.length)
        : 0;
    const avgGeoScore = successfulLogs.length
        ? Math.round(successfulLogs.reduce((s, l) => s + (l.geoScore || 0), 0) / successfulLogs.length)
        : 0;
    const avgAeoScore = successfulLogs.length
        ? Math.round(successfulLogs.reduce((s, l) => s + (l.aeoScore || 0), 0) / successfulLogs.length)
        : 0;

    return {
        schedule: updatedSchedule,
        postsThisMonth: updatedSchedule.postsThisMonth,
        remainingPosts: Math.max(0, MAX_POSTS_PER_MONTH - updatedSchedule.postsThisMonth),
        nextPostDate: updatedSchedule.nextPostDate,
        lastPostDate: updatedSchedule.lastPostDate,
        recentLogs: recentLogs.slice(0, 5),
        averageScores: {
            avgSeoScore,
            avgGeoScore,
            avgAeoScore,
        },
    };
};

/**
 * Generate preview post
 */
export const generateSitePostPreview = async (
    userId: string,
    config: Partial<SiteAutoPostScheduleEntity>
): Promise<any> => {
    const contentSummary = await generateSiteContentSummary(
        config.topics || "",
        config.targetAudience,
        config.tone
    );

    const mockSchedule: SiteAutoPostScheduleEntity = {
        ...config,
        id: "preview",
        userId,
        isActive: false,
        frequency: config.frequency || "5hours",
        postsThisMonth: 0,
        currentMonth: null,
        contentSummary: contentSummary.summary,
        contentSummaryGeneratedAt: new Date(),
        nextPostDate: null,
        lastPostDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferredTime: config.preferredTime || "09:00",
        startDate: null,
        bilingual: config.bilingual !== undefined ? config.bilingual : true,
    } as SiteAutoPostScheduleEntity;

    // Use TOON for preview (faster parallel processing)
    try {
        return await generateSitePostPreviewWithTOON(mockSchedule, contentSummary);
    } catch (error) {
        logger.warn("[SiteAutoPost] TOON preview failed, falling back to standard generation:", error);
        return await generateSiteAutoPost(mockSchedule, contentSummary, null);
    }
};

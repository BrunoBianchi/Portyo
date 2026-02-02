import { AppDataSource } from "../database/datasource";
import { AutoPostScheduleEntity, PostFrequency } from "../database/entity/auto-post-schedule-entity";
import { AutoPostLogEntity } from "../database/entity/auto-post-log-entity";
import { PostEntity } from "../database/entity/posts-entity";
import { BioEntity } from "../database/entity/bio-entity";
import { UserEntity } from "../database/entity/user-entity";
import { 
    generateBioSummary, 
    generateAutoPost, 
    BioSummary, 
    validateContentAndCalculateMetrics,
    generateMetadataFromTopics,
    GeneratedMetadata,
    getLanguageByCountry,
} from "./auto-post-ai.service";
import { logger } from "../shared/utils/logger";
import { LessThan, MoreThan, IsNull, Not } from "typeorm";
import { notificationService } from "./notification.service";
import { NotificationType } from "../database/entity/notification-entity";
import { 
    getCachedPreview, 
    setCachedPreview, 
    invalidatePreviewCache,
    getCachedMetadata,
    setCachedMetadata,
} from "./auto-post-cache.service";

const MAX_POSTS_PER_MONTH = 10;

const scheduleRepository = AppDataSource.getRepository(AutoPostScheduleEntity);
const logRepository = AppDataSource.getRepository(AutoPostLogEntity);
const postRepository = AppDataSource.getRepository(PostEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

/**
 * Parse preferred time string (HH:mm) to hours and minutes
 */
const parsePreferredTime = (preferredTime: string): { hours: number; minutes: number } => {
    const [hours, minutes] = preferredTime.split(":").map(Number);
    return { hours: hours || 9, minutes: minutes || 0 };
};

/**
 * Calculate the next post date based on frequency, preferred time, and start date
 * If the preferred time for today hasn't passed yet, schedule for today
 */
export const calculateNextPostDate = (
    frequency: PostFrequency,
    fromDate: Date = new Date(),
    preferredTime: string = "09:00",
    startDate: Date | null = null,
    lastPostDate: Date | null = null
): Date => {
    const { hours, minutes } = parsePreferredTime(preferredTime);
    const now = new Date(fromDate);
    
    // Create a date for today with the preferred time
    let candidateDate = new Date(now);
    candidateDate.setHours(hours, minutes, 0, 0);
    
    // If start date is in the future, start from there
    if (startDate && startDate > now) {
        candidateDate = new Date(startDate);
        candidateDate.setHours(hours, minutes, 0, 0);
    }
    
    // Check if we already posted today at this time or later
    const alreadyPostedToday = lastPostDate && 
        lastPostDate.toDateString() === now.toDateString() &&
        lastPostDate.getHours() >= hours;
    
    // If candidate time hasn't passed yet AND we haven't posted today, use today
    if (candidateDate > now && !alreadyPostedToday) {
        return candidateDate;
    }
    
    // Otherwise, calculate next date based on frequency
    let nextDate = new Date(candidateDate);
    
    switch (frequency) {
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
            nextDate.setDate(nextDate.getDate() + 7);
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
    schedule: AutoPostScheduleEntity
): Promise<AutoPostScheduleEntity> => {
    const currentMonth = getCurrentMonth();
    
    if (schedule.currentMonth !== currentMonth) {
        schedule.currentMonth = currentMonth;
        schedule.postsThisMonth = 0;
        return await scheduleRepository.save(schedule);
    }
    
    return schedule;
};

/**
 * Check if a slug is unique
 */
const isSlugUnique = async (slug: string, bioId: string): Promise<boolean> => {
    const existing = await postRepository.findOne({
        where: { slug, bio: { id: bioId } },
    });
    return !existing;
};

/**
 * Generate a unique slug by appending a number if needed
 */
const generateUniqueSlug = async (baseSlug: string, bioId: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    
    while (!(await isSlugUnique(slug, bioId))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

/**
 * Check if schedule should run based on start date
 */
const shouldScheduleRun = (schedule: AutoPostScheduleEntity): boolean => {
    if (!schedule.isActive) return false;
    
    // Check if start date is set and in the future
    if (schedule.startDate && new Date() < schedule.startDate) {
        return false;
    }
    
    return true;
};

/**
 * Create or update auto post schedule
 */
export const createOrUpdateSchedule = async (
    userId: string,
    bioId: string,
    config: Partial<AutoPostScheduleEntity>
): Promise<AutoPostScheduleEntity> => {
    let schedule = await scheduleRepository.findOne({
        where: { userId, bioId },
    });

    if (schedule) {
        // Update existing schedule
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
        
        // Recalculate next post date if relevant fields changed or schedule is being activated
        if (config.frequency || config.preferredTime || config.startDate || (config.isActive && !schedule.isActive)) {
            schedule.nextPostDate = calculateNextPostDate(
                schedule.frequency, 
                new Date(), 
                schedule.preferredTime,
                schedule.startDate,
                schedule.lastPostDate
            );
        }
        
        return await scheduleRepository.save(schedule);
    } else {
        // Create new schedule
        const bio = await bioRepository.findOne({ where: { id: bioId } });
        if (!bio) {
            throw new Error("Bio not found");
        }

        const newSchedule = scheduleRepository.create({
            userId,
            bioId,
            frequency: config.frequency || "weekly",
            topics: config.topics || null,
            keywords: config.keywords || null,
            targetAudience: config.targetAudience || null,
            tone: config.tone || "professional",
            postLength: config.postLength || "medium",
            language: config.language || null,
            isActive: config.isActive !== undefined ? config.isActive : true,
            preferredTime: config.preferredTime || "09:00",
            startDate: config.startDate || null,
            targetCountry: config.targetCountry || null,
            nextPostDate: calculateNextPostDate(
                config.frequency || "weekly", 
                new Date(), 
                config.preferredTime || "09:00",
                config.startDate || null,
                null
            ),
            postsThisMonth: 0,
            currentMonth: getCurrentMonth(),
        });

        return await scheduleRepository.save(newSchedule);
    }
};

/**
 * Get schedule by bio ID
 */
export const getScheduleByBioId = async (
    userId: string,
    bioId: string
): Promise<AutoPostScheduleEntity | null> => {
    return await scheduleRepository.findOne({
        where: { userId, bioId },
        relations: ["logs"],
    });
};

/**
 * Toggle schedule active status
 */
export const toggleScheduleStatus = async (
    userId: string,
    bioId: string,
    isActive: boolean
): Promise<AutoPostScheduleEntity | null> => {
    const schedule = await scheduleRepository.findOne({
        where: { userId, bioId },
    });

    if (!schedule) {
        return null;
    }

    schedule.isActive = isActive;
    
    if (isActive && !schedule.nextPostDate) {
        schedule.nextPostDate = calculateNextPostDate(
            schedule.frequency, 
            new Date(), 
            schedule.preferredTime,
            schedule.startDate,
            schedule.lastPostDate
        );
    }

    return await scheduleRepository.save(schedule);
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (
    userId: string,
    bioId: string
): Promise<boolean> => {
    const result = await scheduleRepository.delete({ userId, bioId });
    return result.affected ? result.affected > 0 : false;
};

/**
 * Generate and save bio summary for a schedule
 */
export const generateAndSaveBioSummary = async (
    schedule: AutoPostScheduleEntity
): Promise<BioSummary> => {
    const bio = await bioRepository.findOne({
        where: { id: schedule.bioId },
    });

    if (!bio) {
        throw new Error("Bio not found");
    }

    const summary = await generateBioSummary(bio);
    
    schedule.bioSummary = summary.summary;
    schedule.bioSummaryGeneratedAt = new Date();
    await scheduleRepository.save(schedule);

    return summary;
};

/**
 * Process a single schedule and create post if needed
 */
export const processSchedule = async (schedule: AutoPostScheduleEntity): Promise<void> => {
    try {
        logger.info(`[AutoPost] Processing schedule ${schedule.id} for bio ${schedule.bioId}`);

        // Check if schedule should run (respects start date)
        if (!shouldScheduleRun(schedule)) {
            logger.info(`[AutoPost] Schedule ${schedule.id} not ready to run (inactive or before start date)`);
            return;
        }

        // Check and reset monthly counter
        schedule = await checkAndResetMonthlyCounter(schedule);

        // Check if user has reached monthly limit
        if (schedule.postsThisMonth >= MAX_POSTS_PER_MONTH) {
            logger.info(`[AutoPost] Schedule ${schedule.id} reached monthly limit`);
            return;
        }

        // Check if it's time to post (null nextPostDate means new schedule ready to post)
        if (schedule.nextPostDate && new Date() < schedule.nextPostDate) {
            logger.info(`[AutoPost] Schedule ${schedule.id} not ready for posting yet`);
            return;
        }

        // Check if already posted today (prevent duplicates)
        if (schedule.lastPostDate) {
            const lastPost = new Date(schedule.lastPostDate);
            const today = new Date();
            if (lastPost.toDateString() === today.toDateString()) {
                logger.info(`[AutoPost] Schedule ${schedule.id} already posted today, skipping`);
                // Recalculate next post date to ensure it's set correctly for tomorrow
                schedule.nextPostDate = calculateNextPostDate(
                    schedule.frequency,
                    new Date(),
                    schedule.preferredTime,
                    schedule.startDate,
                    schedule.lastPostDate
                );
                await scheduleRepository.save(schedule);
                return;
            }
        }

        // Get bio
        const bio = await bioRepository.findOne({
            where: { id: schedule.bioId },
        });

        if (!bio) {
            logger.error(`[AutoPost] Bio ${schedule.bioId} not found`);
            return;
        }

        // Get or generate bio summary
        let bioSummary: BioSummary;
        if (schedule.bioSummary && schedule.bioSummaryGeneratedAt) {
            // Use cached summary (valid for 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            if (schedule.bioSummaryGeneratedAt > thirtyDaysAgo) {
                // Reconstruct bio summary from schedule data
                bioSummary = {
                    summary: schedule.bioSummary,
                    industry: "General",
                    expertise: schedule.keywords || [],
                    tone: schedule.tone || "professional",
                    targetAudience: schedule.targetAudience || "General audience",
                    uniqueSellingPoints: [],
                    contentPillars: [],
                };
            } else {
                bioSummary = await generateAndSaveBioSummary(schedule);
            }
        } else {
            bioSummary = await generateAndSaveBioSummary(schedule);
        }

        // Get previous log for improvement suggestions
        const previousLog = await logRepository.findOne({
            where: { scheduleId: schedule.id },
            order: { createdAt: "DESC" },
        });

        // Compile suggestions from previous post
        const previousSuggestions = previousLog ? {
            seo: previousLog.improvementSuggestions || [],
            geo: previousLog.geoSuggestions || [],
            aeo: previousLog.aeoSuggestions || [],
            aio: previousLog.aioSuggestions || [],
        } : null;

        if (previousSuggestions) {
            logger.info(`[AutoPost] Found ${previousSuggestions.seo.length + previousSuggestions.geo.length + previousSuggestions.aeo.length + previousSuggestions.aio.length} suggestions from previous post`);
        }

        // Generate post with previous suggestions for improvement
        logger.info(`[AutoPost] Generating post for schedule ${schedule.id}`);
        const rawGeneratedPost = await generateAutoPost(bio, schedule, bioSummary, previousSuggestions);
        
        // Validate content and calculate accurate metrics (2-stage process)
        logger.info(`[AutoPost] Validating content and calculating metrics for schedule ${schedule.id}`);
        const generatedPost = await validateContentAndCalculateMetrics(rawGeneratedPost, bio, schedule, bioSummary);

        // Ensure unique slug
        const uniqueSlug = await generateUniqueSlug(generatedPost.slug, schedule.bioId);

        // Create the post
        const post = postRepository.create({
            title: generatedPost.title,
            content: generatedPost.content,
            keywords: generatedPost.keywords,
            slug: uniqueSlug,
            status: "published",
            thumbnail: null,
            scheduledAt: new Date(),
            user: { id: schedule.userId } as UserEntity,
            bio: { id: schedule.bioId } as BioEntity,
        });

        const savedPost = await postRepository.save(post);

        // Create log entry with full metrics
        const log = logRepository.create({
            scheduleId: schedule.id,
            postId: savedPost.id,
            status: "published",
            generatedTitle: generatedPost.title,
            generatedContent: generatedPost.content.substring(0, 500) + "...",
            generatedKeywords: generatedPost.keywords,
            
            // Basic SEO
            seoScore: generatedPost.seoMetrics.seoScore,
            metaDescription: generatedPost.metaDescription,
            slug: uniqueSlug,
            titleLength: generatedPost.titleLength,
            metaDescriptionLength: generatedPost.metaDescriptionLength,
            
            // Detailed SEO Metrics
            titleOptimizationScore: generatedPost.seoMetrics.titleOptimizationScore,
            metaDescriptionScore: generatedPost.seoMetrics.metaDescriptionScore,
            contentStructureScore: generatedPost.seoMetrics.contentStructureScore,
            keywordDensityScore: generatedPost.seoMetrics.keywordDensityScore,
            readabilityScore: generatedPost.seoMetrics.readabilityScore,
            internalLinkingScore: generatedPost.seoMetrics.internalLinkingScore,
            
            // GEO Metrics
            geoScore: generatedPost.geoMetrics.geoScore,
            entityRecognitionScore: generatedPost.geoMetrics.entityRecognitionScore,
            answerOptimizationScore: generatedPost.geoMetrics.answerOptimizationScore,
            structuredDataScore: generatedPost.geoMetrics.structuredDataScore,
            authoritySignalsScore: generatedPost.geoMetrics.authoritySignalsScore,
            contextClarityScore: generatedPost.geoMetrics.contextClarityScore,
            conversationalValueScore: generatedPost.geoMetrics.conversationalValueScore,
            featuredSnippetScore: generatedPost.geoMetrics.featuredSnippetScore,
            
            // AEO Metrics
            aeoScore: generatedPost.aeoMetrics.aeoScore,
            answerRelevanceScore: generatedPost.aeoMetrics.answerRelevanceScore,
            directAnswerScore: generatedPost.aeoMetrics.directAnswerScore,
            questionOptimizationScore: generatedPost.aeoMetrics.questionOptimizationScore,
            voiceSearchScore: generatedPost.aeoMetrics.voiceSearchScore,
            clarityScore: generatedPost.aeoMetrics.clarityScore,
            concisenessScore: generatedPost.aeoMetrics.concisenessScore,
            factualAccuracyScore: generatedPost.aeoMetrics.factualAccuracyScore,
            
            // AIO Metrics
            aioScore: generatedPost.aioMetrics.aioScore,
            promptEfficiencyScore: generatedPost.aioMetrics.promptEfficiencyScore,
            contextAdherenceScore: generatedPost.aioMetrics.contextAdherenceScore,
            hallucinationResistanceScore: generatedPost.aioMetrics.hallucinationResistanceScore,
            citationQualityScore: generatedPost.aioMetrics.citationQualityScore,
            multiTurnOptimizationScore: generatedPost.aioMetrics.multiTurnOptimizationScore,
            instructionFollowingScore: generatedPost.aioMetrics.instructionFollowingScore,
            outputConsistencyScore: generatedPost.aioMetrics.outputConsistencyScore,
            
            // Content Quality
            originalityScore: generatedPost.contentQualityMetrics.originalityScore,
            depthScore: generatedPost.contentQualityMetrics.depthScore,
            engagementPotentialScore: generatedPost.contentQualityMetrics.engagementPotentialScore,
            freshnessScore: generatedPost.contentQualityMetrics.freshnessScore,
            
            // Detailed Analysis (JSON)
            keywordAnalysis: generatedPost.keywordAnalysis,
            readabilityMetrics: generatedPost.readabilityMetrics,
            contentAnalysis: generatedPost.contentAnalysis,
            entityAnalysis: generatedPost.entityAnalysis,
            aiOptimization: generatedPost.aiOptimization,
            
            // Suggestions
            improvementSuggestions: generatedPost.improvementSuggestions,
            geoSuggestions: generatedPost.geoSuggestions,
            aeoSuggestions: generatedPost.aeoSuggestions,
            aioSuggestions: generatedPost.aioSuggestions,
        });
        await logRepository.save(log);

        await notificationService.createNotification({
            userId: schedule.userId,
            bioId: schedule.bioId,
            title: "AutoPost publicado ✅",
            message: `Seu AutoPost "${generatedPost.title}" foi publicado.`,
            type: NotificationType.UPDATE,
            icon: "Sparkles",
            link: "/dashboard/auto-post",
            metadata: {
                postId: savedPost.id,
                slug: savedPost.slug,
            },
        });

        // Update schedule
        schedule.lastPostDate = new Date();
        schedule.nextPostDate = calculateNextPostDate(
            schedule.frequency, 
            new Date(), 
            schedule.preferredTime,
            schedule.startDate,
            schedule.lastPostDate
        );
        schedule.postsThisMonth += 1;
        await scheduleRepository.save(schedule);

        logger.info(`[AutoPost] Successfully created post ${savedPost.id} for schedule ${schedule.id} (SEO: ${generatedPost.seoMetrics.seoScore}, GEO: ${generatedPost.geoMetrics.geoScore})`);

    } catch (error: any) {
        logger.error(`[AutoPost] Error processing schedule ${schedule.id}: ${error.message}`);
        
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

        // Update next post date to retry tomorrow
        schedule.nextPostDate = calculateNextPostDate("daily", new Date(), schedule.preferredTime, null, schedule.lastPostDate);
        await scheduleRepository.save(schedule);
    }
};

/**
 * Run the auto-post job - called by cron
 */
export const runAutoPostJob = async (): Promise<void> => {
    logger.info("[AutoPost] Starting auto-post job");

    try {
        const now = new Date();
        
        // Find all active schedules that are due (nextPostDate <= now) OR have null nextPostDate (new schedules)
        const schedules = await scheduleRepository.find({
            where: [
                {
                    isActive: true,
                    nextPostDate: LessThan(now),
                },
                {
                    isActive: true,
                    nextPostDate: IsNull(),
                },
            ],
        });

        // Filter by start date
        const eligibleSchedules = schedules.filter(s => shouldScheduleRun(s));

        logger.info(`[AutoPost] Found ${eligibleSchedules.length} eligible schedules to process (filtered from ${schedules.length})`);

        for (const schedule of eligibleSchedules) {
            await processSchedule(schedule);
        }

        logger.info("[AutoPost] Auto-post job completed");
    } catch (error: any) {
        logger.error(`[AutoPost] Error in auto-post job: ${error.message}`);
    }
};

/**
 * Get auto-post statistics for a user
 */
export const getAutoPostStats = async (
    userId: string,
    bioId: string
): Promise<{
    schedule: AutoPostScheduleEntity | null;
    postsThisMonth: number;
    remainingPosts: number;
    nextPostDate: Date | null;
    recentLogs: AutoPostLogEntity[];
    averageScores: {
        avgSeoScore: number;
        avgGeoScore: number;
        avgAeoScore: number;
        avgAioScore: number;
        avgReadability: number;
    };
    lastPostDate: Date | null;
}> => {
    const schedule = await scheduleRepository.findOne({
        where: { userId, bioId },
    });

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
                avgAioScore: 0,
                avgReadability: 0,
            },
        };
    }

    // Reset counter if needed
    const updatedSchedule = await checkAndResetMonthlyCounter(schedule);

    // Get recent logs with metrics
    const recentLogs = await logRepository.find({
        where: { scheduleId: schedule.id },
        order: { createdAt: "DESC" },
        take: 10,
    });

    // Calculate average scores from successful posts
    const successfulLogs = recentLogs.filter(log => log.status === "published" && log.seoScore);
    const avgSeoScore = successfulLogs.length > 0
        ? Math.round(successfulLogs.reduce((sum, log) => sum + (log.seoScore || 0), 0) / successfulLogs.length)
        : 0;
    const avgGeoScore = successfulLogs.length > 0
        ? Math.round(successfulLogs.reduce((sum, log) => sum + (log.geoScore || 0), 0) / successfulLogs.length)
        : 0;
    const avgAeoScore = successfulLogs.length > 0
        ? Math.round(successfulLogs.reduce((sum, log) => sum + (log.aeoScore || 0), 0) / successfulLogs.length)
        : 0;
    const avgAioScore = successfulLogs.length > 0
        ? Math.round(successfulLogs.reduce((sum, log) => sum + (log.aioScore || 0), 0) / successfulLogs.length)
        : 0;
    const avgReadability = successfulLogs.length > 0
        ? Math.round(successfulLogs.reduce((sum, log) => sum + (log.readabilityScore || 0), 0) / successfulLogs.length)
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
            avgAioScore,
            avgReadability,
        },
    };
};

/**
 * Get all schedules for a user
 */
export const getUserSchedules = async (userId: string): Promise<AutoPostScheduleEntity[]> => {
    return await scheduleRepository.find({
        where: { userId },
        relations: ["bio"],
        order: { createdAt: "DESC" },
    });
};

/**
 * Generate post preview with full metrics (with Redis caching)
 */
export const generatePreviewPost = async (
    userId: string,
    bioId: string,
    config: Partial<AutoPostScheduleEntity>
): Promise<any> => {
    const bio = await bioRepository.findOne({ where: { id: bioId } });
    if (!bio) {
        throw new Error("Bio not found");
    }

    // Check cache first
    const cachedPreview = await getCachedPreview(userId, bioId, config);
    if (cachedPreview) {
        logger.info(`[AutoPost] Returning cached preview for user ${userId}, bio ${bioId}`);
        return cachedPreview;
    }

    // Get or generate bio summary
    let bioSummary: BioSummary;
    const existingSchedule = await scheduleRepository.findOne({ where: { userId, bioId } });
    
    if (existingSchedule?.bioSummary && existingSchedule?.bioSummaryGeneratedAt) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (existingSchedule.bioSummaryGeneratedAt > thirtyDaysAgo) {
            bioSummary = {
                summary: existingSchedule.bioSummary,
                industry: "General",
                expertise: existingSchedule.keywords || [],
                tone: existingSchedule.tone || "professional",
                targetAudience: existingSchedule.targetAudience || "General audience",
                uniqueSellingPoints: [],
                contentPillars: [],
            };
        } else {
            bioSummary = await generateBioSummary(bio);
        }
    } else {
        bioSummary = await generateBioSummary(bio);
    }

    // Generate preview using config
    const mockSchedule: AutoPostScheduleEntity = {
        ...config,
        id: "preview",
        bioId,
        userId,
        isActive: false,
        frequency: config.frequency || "weekly",
        postsThisMonth: 0,
        currentMonth: null,
        bioSummary: bioSummary.summary,
        bioSummaryGeneratedAt: new Date(),
        nextPostDate: null,
        lastPostDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferredTime: config.preferredTime || "09:00",
        startDate: null,
    } as AutoPostScheduleEntity;

    const generatedPost = await generateAutoPost(bio, mockSchedule, bioSummary, null);
    
    // Validate content and calculate accurate metrics
    const validatedPost = await validateContentAndCalculateMetrics(generatedPost, bio, mockSchedule, bioSummary);
    
    // Cache the result
    await setCachedPreview(userId, bioId, config, validatedPost);
    
    return validatedPost;
};


/**
 * Generate metadata (keywords, tags, target audience) from topics
 * Uses cache to avoid redundant AI calls
 */
export const generateMetadataFromTopicsService = async (
    userId: string,
    bioId: string,
    topics: string,
    targetCountry?: string | null,
    language?: string | null
): Promise<GeneratedMetadata> => {
    // Check cache first
    const cachedMetadata = await getCachedMetadata(userId, bioId, topics);
    if (cachedMetadata) {
        logger.info(`[AutoPost] Returning cached metadata for user ${userId}, bio ${bioId}`);
        return {
            keywords: cachedMetadata.keywords,
            tags: cachedMetadata.tags,
            targetAudience: cachedMetadata.targetAudience,
            suggestedTopics: [],
            contentAngles: [],
        };
    }

    const bio = await bioRepository.findOne({ where: { id: bioId } });
    if (!bio) {
        throw new Error("Bio not found");
    }

    // Get or generate bio summary
    let bioSummary: BioSummary;
    const existingSchedule = await scheduleRepository.findOne({ where: { userId, bioId } });
    
    if (existingSchedule?.bioSummary && existingSchedule?.bioSummaryGeneratedAt) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (existingSchedule.bioSummaryGeneratedAt > thirtyDaysAgo) {
            bioSummary = {
                summary: existingSchedule.bioSummary,
                industry: "General",
                expertise: existingSchedule.keywords || [],
                tone: existingSchedule.tone || "professional",
                targetAudience: existingSchedule.targetAudience || "General audience",
                uniqueSellingPoints: [],
                contentPillars: [],
            };
        } else {
            bioSummary = await generateBioSummary(bio);
        }
    } else {
        bioSummary = await generateBioSummary(bio);
    }

    // Generate metadata from AI
    const metadata = await generateMetadataFromTopics(topics, bioSummary, targetCountry, language);
    
    // Cache the result
    await setCachedMetadata(userId, bioId, topics, {
        topics,
        keywords: metadata.keywords,
        tags: metadata.tags,
        targetAudience: metadata.targetAudience,
    });
    
    return metadata;
};

/**
 * Get language by country code (exposed from AI service)
 */
export { getLanguageByCountry };

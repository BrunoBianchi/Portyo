import { LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../database/datasource";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { SocialPlannerPostEntity } from "../database/entity/social-planner-post-entity";
import { instagramService } from "./instagram.service";
import { logger } from "../shared/utils/logger";
import redisClient from "../config/redis.client";

type PublishResult = {
    success: boolean;
    statusCode: number;
    message: string;
    post: SocialPlannerPostEntity | null;
};

const channelProviderMap: Record<string, string> = {
    instagram: "instagram",
    facebook: "facebook",
    linkedin: "linkedin",
    twitter: "twitter",
    threads: "threads",
};

const SOCIAL_PLANNER_QUEUE_KEY = "social-planner:publish:queue";

const buildInstagramCaption = (post: SocialPlannerPostEntity) => {
    const content = post.content?.trim() || "";
    const hashtags = (post.hashtags || [])
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

    const merged = [content, hashtags.join(" ")]
        .filter(Boolean)
        .join("\n\n")
        .trim();

    return merged.length > 2200 ? merged.slice(0, 2197) + "..." : merged;
};

export const publishSocialPlannerPost = async (
    postId: string,
    bioId: string,
    userId: string
): Promise<PublishResult> => {
    const repository = AppDataSource.getRepository(SocialPlannerPostEntity);
    const integrationRepository = AppDataSource.getRepository(IntegrationEntity);

    const post = await repository.findOne({ where: { id: postId, bioId, userId } });
    if (!post) {
        return {
            success: false,
            statusCode: 404,
            message: "Post not found",
            post: null,
        };
    }

    const provider = channelProviderMap[post.channel];
    if (!provider) {
        post.status = "failed";
        post.errorMessage = `Unsupported channel: ${post.channel}`;
        post.publishedAt = null;
        post.externalPostId = null;
        const saved = await repository.save(post);

        return {
            success: false,
            statusCode: 422,
            message: "Unsupported channel",
            post: saved,
        };
    }

    let integration = await integrationRepository.findOne({
        where: {
            bio: { id: bioId },
            provider,
        },
        relations: ["bio"],
    });

    if (!integration?.accessToken) {
        post.status = "failed";
        post.errorMessage = `No active ${post.channel} integration found for this bio.`;
        post.publishedAt = null;
        post.externalPostId = null;
        const failedPost = await repository.save(post);

        return {
            success: false,
            statusCode: 422,
            message: "Publishing failed: missing channel integration",
            post: failedPost,
        };
    }

    try {
        if (post.channel === "instagram") {
            if (!integration.account_id) {
                post.status = "failed";
                post.errorMessage = "Instagram integration is missing business account ID.";
                post.publishedAt = null;
                post.externalPostId = null;
                const failedPost = await repository.save(post);

                return {
                    success: false,
                    statusCode: 422,
                    message: "Publishing failed: invalid Instagram integration",
                    post: failedPost,
                };
            }

            const mediaUrl = (post.mediaUrls || []).find((url) => typeof url === "string" && url.trim().length > 0);
            if (!mediaUrl) {
                post.status = "failed";
                post.errorMessage = "Instagram publishing requires at least one image URL.";
                post.publishedAt = null;
                post.externalPostId = null;
                const failedPost = await repository.save(post);

                return {
                    success: false,
                    statusCode: 422,
                    message: "Publishing failed: missing Instagram media",
                    post: failedPost,
                };
            }

            const caption = buildInstagramCaption(post);
            integration = await instagramService.ensureFreshIntegrationAccessToken(
                integration,
                integrationRepository,
                { thresholdSeconds: 24 * 60 * 60 }
            );

            if (!integration.account_id || !integration.accessToken) {
                throw new Error("Instagram integration is missing token or account ID after refresh.");
            }

            const instagramBusinessAccountId = integration.account_id;
            const instagramAccessToken = integration.accessToken;

            let publishResult;
            try {
                publishResult = await instagramService.publishImagePost({
                    instagramBusinessAccountId,
                    accessToken: instagramAccessToken,
                    imageUrl: mediaUrl,
                    caption,
                });
            } catch (error: any) {
                if (!instagramService.isAuthTokenError(error)) {
                    throw error;
                }

                integration = await instagramService.ensureFreshIntegrationAccessToken(
                    integration,
                    integrationRepository,
                    { forceRefresh: true }
                );

                if (!integration.account_id || !integration.accessToken) {
                    throw new Error("Instagram integration is missing token or account ID after retry refresh.");
                }

                publishResult = await instagramService.publishImagePost({
                    instagramBusinessAccountId: integration.account_id,
                    accessToken: integration.accessToken,
                    imageUrl: mediaUrl,
                    caption,
                });
            }

            post.status = "published";
            post.publishedAt = new Date();
            post.errorMessage = null;
            post.externalPostId = publishResult.id;

            const publishedPost = await repository.save(post);

            return {
                success: true,
                statusCode: 200,
                message: "Post published successfully",
                post: publishedPost,
            };
        }

        post.status = "published";
        post.publishedAt = new Date();
        post.errorMessage = null;
        post.externalPostId = `sim_${post.channel}_${Date.now()}`;

        const publishedPost = await repository.save(post);

        return {
            success: true,
            statusCode: 200,
            message: "Post published successfully",
            post: publishedPost,
        };
    } catch (error: any) {
        post.status = "failed";
        post.publishedAt = null;
        post.externalPostId = null;
        post.errorMessage = error?.message || "Failed to publish post";
        const failedPost = await repository.save(post);

        return {
            success: false,
            statusCode: 422,
            message: post.errorMessage || "Failed to publish post",
            post: failedPost,
        };
    }
};

export const enqueueDueSocialPlannerPosts = async (): Promise<number> => {
    const repository = AppDataSource.getRepository(SocialPlannerPostEntity);
    const now = new Date();
    const nowTs = now.getTime();

    const duePosts = await repository.find({
        where: {
            status: "scheduled",
            scheduledAt: LessThanOrEqual(now),
        },
        order: {
            scheduledAt: "ASC",
        },
        take: 500,
    });

    if (duePosts.length === 0) {
        logger.info("[SocialPlannerCron] No due social planner posts to enqueue.");
        return 0;
    }

    let enqueuedCount = 0;

    for (const post of duePosts) {
        try {
            const added = await redisClient.zadd(SOCIAL_PLANNER_QUEUE_KEY, nowTs, post.id);
            if (Number(added) > 0) {
                enqueuedCount += 1;
            }
        } catch (error: any) {
            logger.error(`[SocialPlannerCron] Failed to enqueue post ${post.id}: ${error?.message || error}`);
        }
    }

    logger.info(`[SocialPlannerCron] Enqueued ${enqueuedCount}/${duePosts.length} due post(s) to Redis queue.`);

    return enqueuedCount;
};

export const processSocialPlannerQueue = async (batchSize = 100): Promise<void> => {
    const nowTs = Date.now();
    const repository = AppDataSource.getRepository(SocialPlannerPostEntity);

    const queuedPostIds = await redisClient.zrangebyscore(
        SOCIAL_PLANNER_QUEUE_KEY,
        "-inf",
        String(nowTs),
        "LIMIT",
        0,
        batchSize
    );

    if (!queuedPostIds.length) {
        logger.info("[SocialPlannerQueue] No queued social planner posts to process.");
        return;
    }

    logger.info(`[SocialPlannerQueue] Processing ${queuedPostIds.length} queued social planner post(s).`);

    let successCount = 0;
    let failureCount = 0;

    for (const postId of queuedPostIds) {
        try {
            const post = await repository.findOne({ where: { id: postId } });

            if (!post || post.status !== "scheduled") {
                await redisClient.zrem(SOCIAL_PLANNER_QUEUE_KEY, postId);
                continue;
            }

            if (!post.scheduledAt || new Date(post.scheduledAt).getTime() > nowTs) {
                continue;
            }

            const result = await publishSocialPlannerPost(post.id, post.bioId, post.userId);

            if (result.success) {
                successCount += 1;
            } else {
                failureCount += 1;
                logger.warn(`[SocialPlannerQueue] Failed to publish post ${post.id}: ${result.message}`);
            }

            await redisClient.zrem(SOCIAL_PLANNER_QUEUE_KEY, postId);
        } catch (error: any) {
            failureCount += 1;
            logger.error(`[SocialPlannerQueue] Unexpected error while processing queued post ${postId}: ${error?.message || error}`);
            await redisClient.zrem(SOCIAL_PLANNER_QUEUE_KEY, postId);
        }
    }

    logger.info(`[SocialPlannerQueue] Completed. Success: ${successCount}, Failed: ${failureCount}.`);
};

export const runSocialPlannerJob = async (): Promise<void> => {
    await enqueueDueSocialPlannerPosts();
    await processSocialPlannerQueue(500);
};

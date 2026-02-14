import { LessThanOrEqual } from "typeorm";
import { AppDataSource } from "../database/datasource";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { SocialPlannerPostEntity } from "../database/entity/social-planner-post-entity";
import { instagramService } from "./instagram.service";
import { logger } from "../shared/utils/logger";

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
};

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

            let publishResult;
            try {
                publishResult = await instagramService.publishImagePost({
                    instagramBusinessAccountId: integration.account_id,
                    accessToken: integration.accessToken,
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

export const runSocialPlannerJob = async (): Promise<void> => {
    const repository = AppDataSource.getRepository(SocialPlannerPostEntity);
    const now = new Date();

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
        logger.info("[SocialPlannerCron] No scheduled posts due for publication.");
        return;
    }

    logger.info(`[SocialPlannerCron] Found ${duePosts.length} scheduled post(s) due for publication.`);

    let successCount = 0;
    let failureCount = 0;

    for (const post of duePosts) {
        try {
            const result = await publishSocialPlannerPost(post.id, post.bioId, post.userId);
            if (result.success) {
                successCount += 1;
            } else {
                failureCount += 1;
                logger.warn(`[SocialPlannerCron] Failed to publish post ${post.id}: ${result.message}`);
            }
        } catch (error: any) {
            failureCount += 1;
            logger.error(`[SocialPlannerCron] Unexpected error while publishing post ${post.id}:`, error?.message || error);
        }
    }

    logger.info(`[SocialPlannerCron] Completed. Success: ${successCount}, Failed: ${failureCount}.`);
};

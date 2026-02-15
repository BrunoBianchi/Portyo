import { Router } from "express";
import { z } from "zod";
import { Between } from "typeorm";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { requirePaidPlan } from "../../../middlewares/user-pro.middleware";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";
import { SocialPlannerPostEntity } from "../../../database/entity/social-planner-post-entity";
import { publishSocialPlannerPost } from "../../../services/social-planner.service";
import { generateSocialPlannerQueuePlan } from "../../../services/social-planner-ai.service";

const router = Router();

const CHANNELS = ["instagram", "facebook", "linkedin", "twitter", "threads"] as const;
const STATUSES = ["draft", "scheduled", "published", "failed", "cancelled"] as const;

const ScheduledAtSchema = z.coerce.date();

const CreatePostSchema = z.object({
    channel: z.enum(CHANNELS),
    title: z.string().max(140).optional().nullable(),
    content: z.string().min(1),
    mediaUrls: z.array(z.string().min(1)).optional(),
    hashtags: z.array(z.string().min(1)).optional(),
    timezone: z.string().optional(),
    scheduledAt: ScheduledAtSchema,
});

const UpdatePostSchema = z.object({
    channel: z.enum(CHANNELS).optional(),
    title: z.string().max(140).optional().nullable(),
    content: z.string().min(1).optional(),
    mediaUrls: z.array(z.string().min(1)).optional(),
    hashtags: z.array(z.string().min(1)).optional(),
    timezone: z.string().optional(),
    scheduledAt: ScheduledAtSchema.optional().nullable(),
    status: z.enum(STATUSES).optional(),
});

const QuerySchema = z.object({
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    channel: z.enum(CHANNELS).or(z.literal("all")).optional(),
    status: z.enum(STATUSES).or(z.literal("all")).optional(),
});

const AutoQueuePlanSchema = z.object({
    apply: z.boolean().optional().default(false),
    options: z.object({
        timezone: z.string().optional(),
        channels: z.array(z.enum(CHANNELS)).min(1).max(5).optional(),
        postsCount: z.number().int().min(1).max(60).optional(),
        horizonDays: z.number().int().min(3).max(120).optional(),
        preferredWeekdays: z.array(z.number().int().min(0).max(6)).optional(),
        preferredHourStart: z.number().int().min(0).max(23).optional(),
        preferredHourEnd: z.number().int().min(0).max(23).optional(),
        minGapHours: z.number().int().min(1).max(72).optional(),
        objective: z.enum(["reach", "engagement", "traffic", "conversions"]).optional(),
        tone: z.string().min(1).max(80).optional(),
        avoidWeekends: z.boolean().optional(),
    }).optional(),
});

const hasAtLeastOneMediaUrl = (mediaUrls: string[] | null | undefined) =>
    Array.isArray(mediaUrls) && mediaUrls.some((url) => typeof url === "string" && url.trim().length > 0);

const getOwnedBio = async (bioId: string, userId: string) => {
    const bioRepo = AppDataSource.getRepository(BioEntity);
    return bioRepo.findOne({ where: { id: bioId, userId } });
};

router.use(authMiddleware);
router.use(requirePaidPlan);

router.get("/:bioId/posts", async (req, res) => {
    try {
        const { bioId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const query = QuerySchema.parse(req.query);
        const repository = AppDataSource.getRepository(SocialPlannerPostEntity);

        const where: any = {
            bioId,
            userId,
        };

        if (query.channel && query.channel !== "all") {
            where.channel = query.channel;
        }

        if (query.status && query.status !== "all") {
            where.status = query.status;
        }

        if (query.startDate && query.endDate) {
            where.scheduledAt = Between(new Date(query.startDate), new Date(query.endDate));
        }

        const posts = await repository.find({
            where,
            order: {
                scheduledAt: "ASC",
                createdAt: "DESC",
            },
            take: 500,
        });

        return res.json(posts);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid query", issues: error.issues });
        }

        return res.status(500).json({ message: "Failed to fetch social planner posts" });
    }
});

router.get("/:bioId/summary", async (req, res) => {
    try {
        const { bioId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const repository = AppDataSource.getRepository(SocialPlannerPostEntity);
        const posts = await repository.find({
            where: { bioId, userId },
            take: 1000,
            order: { createdAt: "DESC" },
        });

        const summary = {
            total: posts.length,
            draft: posts.filter((post) => post.status === "draft").length,
            scheduled: posts.filter((post) => post.status === "scheduled").length,
            published: posts.filter((post) => post.status === "published").length,
            failed: posts.filter((post) => post.status === "failed").length,
            cancelled: posts.filter((post) => post.status === "cancelled").length,
            upcoming: posts.filter((post) => post.status === "scheduled" && post.scheduledAt && post.scheduledAt > new Date()).length,
        };

        return res.json(summary);
    } catch {
        return res.status(500).json({ message: "Failed to fetch social planner summary" });
    }
});

router.post("/:bioId/posts", async (req, res) => {
    try {
        const { bioId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const payload = CreatePostSchema.parse(req.body);
        const scheduledDate = payload.scheduledAt;
        if (scheduledDate <= new Date()) {
            return res.status(400).json({ message: "scheduledAt must be a future date/time" });
        }

        const normalizedMediaUrls = (payload.mediaUrls || [])
            .map((url) => url.trim())
            .filter(Boolean);

        if (payload.channel === "instagram" && !hasAtLeastOneMediaUrl(normalizedMediaUrls)) {
            return res.status(400).json({ message: "Instagram posts require at least one media URL" });
        }

        const repository = AppDataSource.getRepository(SocialPlannerPostEntity);
        const post = repository.create({
            bioId,
            userId,
            channel: payload.channel,
            title: payload.title ?? null,
            content: payload.content,
            mediaUrls: normalizedMediaUrls,
            hashtags: payload.hashtags ?? [],
            timezone: payload.timezone || "UTC",
            scheduledAt: scheduledDate,
            status: "scheduled",
            errorMessage: null,
            publishedAt: null,
            externalPostId: null,
        });

        const created = await repository.save(post);
        return res.status(201).json(created);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid payload", issues: error.issues });
        }

        return res.status(500).json({ message: "Failed to create social planner post" });
    }
});

router.post("/:bioId/queue/auto-plan", async (req, res) => {
    try {
        const { bioId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const payload = AutoQueuePlanSchema.parse(req.body || {});
        const plan = await generateSocialPlannerQueuePlan(bio, payload.options || {});

        let created: SocialPlannerPostEntity[] = [];

        if (payload.apply) {
            const repository = AppDataSource.getRepository(SocialPlannerPostEntity);

            const postEntities = plan.queue.map((item) => repository.create({
                bioId,
                userId,
                channel: item.channel,
                title: item.title || null,
                content: item.content,
                hashtags: item.hashtags,
                mediaUrls: [],
                timezone: plan.options.timezone || "UTC",
                scheduledAt: new Date(item.scheduledAt),
                status: "scheduled",
                errorMessage: null,
                publishedAt: null,
                externalPostId: null,
            }));

            if (postEntities.length) {
                created = await repository.save(postEntities);
            }
        }

        return res.status(200).json({
            success: true,
            applied: payload.apply,
            options: plan.options,
            tokenSavings: plan.tokenSavings,
            queue: plan.queue,
            createdCount: created.length,
            created,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid payload", issues: error.issues });
        }

        return res.status(500).json({ message: "Failed to generate AI queue plan" });
    }
});

router.patch("/:bioId/posts/:postId", async (req, res) => {
    try {
        const { bioId, postId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const payload = UpdatePostSchema.parse(req.body);
        const repository = AppDataSource.getRepository(SocialPlannerPostEntity);

        const post = await repository.findOne({ where: { id: postId, bioId, userId } });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (payload.channel) post.channel = payload.channel;
        if (payload.title !== undefined) post.title = payload.title;
        if (payload.content !== undefined) post.content = payload.content;
        if (payload.mediaUrls !== undefined) {
            post.mediaUrls = payload.mediaUrls
                .map((url) => url.trim())
                .filter(Boolean);
        }
        if (payload.hashtags !== undefined) post.hashtags = payload.hashtags;
        if (payload.timezone !== undefined) post.timezone = payload.timezone;

        const nextChannel = payload.channel ?? post.channel;
        const nextMediaUrls = payload.mediaUrls !== undefined
            ? payload.mediaUrls.map((url) => url.trim()).filter(Boolean)
            : post.mediaUrls;

        if (nextChannel === "instagram" && !hasAtLeastOneMediaUrl(nextMediaUrls)) {
            return res.status(400).json({ message: "Instagram posts require at least one media URL" });
        }

        if (payload.scheduledAt !== undefined) {
            if (!payload.scheduledAt) {
                return res.status(400).json({ message: "scheduledAt cannot be empty" });
            }

            const scheduledDate = payload.scheduledAt;
            if (scheduledDate <= new Date()) {
                return res.status(400).json({ message: "scheduledAt must be a future date/time" });
            }

            post.scheduledAt = scheduledDate;

            if (post.status !== "published" && post.status !== "cancelled") {
                post.status = "scheduled";
            }
        } else if (payload.status) {
            post.status = payload.status;
        }

        post.errorMessage = post.status === "failed" ? post.errorMessage : null;

        const updated = await repository.save(post);
        return res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid payload", issues: error.issues });
        }

        return res.status(500).json({ message: "Failed to update social planner post" });
    }
});

router.delete("/:bioId/posts/:postId", async (req, res) => {
    try {
        const { bioId, postId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const repository = AppDataSource.getRepository(SocialPlannerPostEntity);
        const post = await repository.findOne({ where: { id: postId, bioId, userId } });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        await repository.remove(post);
        return res.status(204).send();
    } catch {
        return res.status(500).json({ message: "Failed to delete social planner post" });
    }
});

router.post("/:bioId/posts/:postId/publish-now", async (req, res) => {
    try {
        const { bioId, postId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const result = await publishSocialPlannerPost(postId, bioId, userId);
        if (!result.post) {
            return res.status(result.statusCode).json({ message: result.message });
        }

        if (!result.success) {
            return res.status(result.statusCode).json({
                message: result.message,
                post: result.post,
            });
        }

        return res.status(result.statusCode).json({
            message: result.message,
            post: result.post,
        });
    } catch {
        return res.status(500).json({ message: "Failed to publish post now" });
    }
});

router.post("/:bioId/posts/:postId/cancel", async (req, res) => {
    try {
        const { bioId, postId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const bio = await getOwnedBio(bioId, userId);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        const repository = AppDataSource.getRepository(SocialPlannerPostEntity);
        const post = await repository.findOne({ where: { id: postId, bioId, userId } });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.status = "cancelled";
        post.errorMessage = null;

        const cancelledPost = await repository.save(post);
        return res.json(cancelledPost);
    } catch {
        return res.status(500).json({ message: "Failed to cancel post" });
    }
});

export default router;

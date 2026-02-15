import { AppDataSource } from "../database/datasource";
import { BioEntity } from "../database/entity/bio-entity";
import { SocialChannel, SocialPlannerPostEntity } from "../database/entity/social-planner-post-entity";
import { buildBAMLPrompt } from "./baml-adapter";
import { groqChatCompletion } from "./groq-client.service";
import { env } from "../config/env";
import { ToonTemplates } from "./toon.service";

export interface SocialPlannerQueuePlanOptions {
    timezone?: string;
    channels: SocialChannel[];
    postsCount: number;
    horizonDays: number;
    preferredWeekdays?: number[];
    preferredHourStart?: number;
    preferredHourEnd?: number;
    minGapHours?: number;
    objective?: "reach" | "engagement" | "traffic" | "conversions";
    tone?: string;
    avoidWeekends?: boolean;
}

export interface PlannedQueuePost {
    channel: SocialChannel;
    title: string;
    content: string;
    hashtags: string[];
    scheduledAt: string;
    reason: string;
    confidence: number;
}

const DEFAULT_HOURS_BY_OBJECTIVE: Record<string, number[]> = {
    reach: [11, 12, 18, 19],
    engagement: [9, 12, 20],
    traffic: [8, 13, 21],
    conversions: [10, 14, 19],
};

const normalizeOptions = (options: Partial<SocialPlannerQueuePlanOptions>): SocialPlannerQueuePlanOptions => {
    const postsCount = Math.max(1, Math.min(60, Number(options.postsCount || 8)));
    const horizonDays = Math.max(3, Math.min(120, Number(options.horizonDays || 28)));
    const preferredHourStart = Math.max(0, Math.min(23, Number(options.preferredHourStart ?? 9)));
    const preferredHourEnd = Math.max(preferredHourStart, Math.min(23, Number(options.preferredHourEnd ?? 21)));

    return {
        timezone: options.timezone || "UTC",
        channels: (options.channels?.length ? options.channels : ["instagram"]) as SocialChannel[],
        postsCount,
        horizonDays,
        preferredWeekdays: Array.isArray(options.preferredWeekdays)
            ? options.preferredWeekdays.filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)
            : undefined,
        preferredHourStart,
        preferredHourEnd,
        minGapHours: Math.max(1, Math.min(72, Number(options.minGapHours ?? 12))),
        objective: (options.objective || "reach") as "reach" | "engagement" | "traffic" | "conversions",
        tone: options.tone || "strategic and clear",
        avoidWeekends: options.avoidWeekends !== false,
    };
};

const getHistoricalHeatmap = (posts: SocialPlannerPostEntity[]) => {
    const heatmap = new Map<string, number>();

    for (const post of posts) {
        const sourceDate = post.publishedAt || post.scheduledAt;
        if (!sourceDate) continue;

        const date = new Date(sourceDate);
        const key = `${date.getDay()}-${date.getHours()}`;
        heatmap.set(key, (heatmap.get(key) || 0) + 1);
    }

    return Array.from(heatmap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([slot, count]) => ({ slot, count }));
};

const parseQueueResponse = (raw: any): PlannedQueuePost[] => {
    if (!raw) return [];

    const queue = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.queue)
            ? raw.queue
            : Array.isArray(raw.posts)
                ? raw.posts
                : [];

    return queue
        .map((item: any) => ({
            channel: String(item.channel || "instagram") as SocialChannel,
            title: String(item.title || "").trim(),
            content: String(item.content || "").trim(),
            hashtags: Array.isArray(item.hashtags)
                ? item.hashtags.map((tag: any) => String(tag || "").trim()).filter(Boolean)
                : [],
            scheduledAt: String(item.scheduledAt || "").trim(),
            reason: String(item.reason || "Optimized schedule based on audience activity.").trim(),
            confidence: Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 70,
        }))
        .filter((item: PlannedQueuePost) => item.content && item.scheduledAt);
};

const channelWeight = (channel: SocialChannel) => {
    if (channel === "instagram") return 1.2;
    if (channel === "threads") return 1.15;
    if (channel === "linkedin") return 1.1;
    if (channel === "facebook") return 1.0;
    return 0.9;
};

const generateFallbackQueue = (
    options: SocialPlannerQueuePlanOptions,
    existingScheduleDates: Date[]
): PlannedQueuePost[] => {
    const result: PlannedQueuePost[] = [];
    const used = existingScheduleDates.map((date) => date.getTime());

    const dayPreferences = options.preferredWeekdays?.length
        ? options.preferredWeekdays
        : [1, 2, 3, 4, 5];

    const objectiveHours = DEFAULT_HOURS_BY_OBJECTIVE[options.objective || "reach"] || [11, 19];
    const hourCandidates = objectiveHours.filter(
        (hour) => hour >= (options.preferredHourStart || 9) && hour <= (options.preferredHourEnd || 21)
    );
    const fallbackHours = hourCandidates.length ? hourCandidates : [options.preferredHourStart || 9];

    let cursor = new Date();
    cursor.setMinutes(0, 0, 0);
    cursor.setHours((options.preferredHourStart || 9) + 1);

    const minGapMs = (options.minGapHours || 12) * 60 * 60 * 1000;

    while (result.length < options.postsCount) {
        cursor = new Date(cursor.getTime() + 60 * 60 * 1000);

        const day = cursor.getDay();
        const hour = cursor.getHours();

        if (options.avoidWeekends && (day === 0 || day === 6)) continue;
        if (!dayPreferences.includes(day)) continue;
        if (!fallbackHours.includes(hour)) continue;

        const candidateTs = cursor.getTime();
        const tooClose = used.some((item) => Math.abs(item - candidateTs) < minGapMs);
        if (tooClose) continue;

        used.push(candidateTs);

        const channel = options.channels[result.length % options.channels.length];
        result.push({
            channel,
            title: `Planned ${channel} post #${result.length + 1}`,
            content: `Content idea optimized for ${options.objective}.`,
            hashtags: ["portyo", "social", options.objective || "reach"],
            scheduledAt: new Date(candidateTs).toISOString(),
            reason: "Fallback smart slot based on preferred days, hour window and spacing.",
            confidence: Math.round(60 * channelWeight(channel)),
        });
    }

    return result;
};

const sanitizePlan = (
    items: PlannedQueuePost[],
    options: SocialPlannerQueuePlanOptions,
    existingScheduleDates: Date[]
): PlannedQueuePost[] => {
    const horizonLimit = Date.now() + options.horizonDays * 24 * 60 * 60 * 1000;
    const minGapMs = (options.minGapHours || 12) * 60 * 60 * 1000;
    const used = existingScheduleDates.map((date) => date.getTime());

    const validItems = items
        .map((item) => {
            const candidate = new Date(item.scheduledAt);
            if (Number.isNaN(candidate.getTime())) return null;
            if (candidate.getTime() <= Date.now()) return null;
            if (candidate.getTime() > horizonLimit) return null;

            const day = candidate.getDay();
            if (options.avoidWeekends && (day === 0 || day === 6)) return null;

            if (options.preferredWeekdays?.length && !options.preferredWeekdays.includes(day)) return null;

            const hour = candidate.getHours();
            if (hour < (options.preferredHourStart || 0) || hour > (options.preferredHourEnd || 23)) return null;

            const tooClose = used.some((itemTs) => Math.abs(itemTs - candidate.getTime()) < minGapMs);
            if (tooClose) return null;

            used.push(candidate.getTime());

            return {
                ...item,
                channel: options.channels.includes(item.channel) ? item.channel : options.channels[0],
                title: item.title || `Planned ${item.channel} post`,
                confidence: Math.max(1, Math.min(100, item.confidence || 70)),
                scheduledAt: candidate.toISOString(),
            };
        })
        .filter(Boolean) as PlannedQueuePost[];

    return validItems.slice(0, options.postsCount);
};

export const generateSocialPlannerQueuePlan = async (
    bio: BioEntity,
    optionsInput: Partial<SocialPlannerQueuePlanOptions>
): Promise<{ options: SocialPlannerQueuePlanOptions; queue: PlannedQueuePost[]; tokenSavings: number }> => {
    const options = normalizeOptions(optionsInput);

    const postRepo = AppDataSource.getRepository(SocialPlannerPostEntity);
    const existingPosts = await postRepo.find({
        where: { bioId: bio.id, userId: bio.userId },
        order: { scheduledAt: "ASC", createdAt: "DESC" },
        take: 500,
    });

    const existingScheduleDates = existingPosts
        .filter((post) => post.scheduledAt && ["scheduled", "draft"].includes(post.status))
        .map((post) => new Date(post.scheduledAt as Date));

    const historicalHeatmap = getHistoricalHeatmap(existingPosts.filter((post) => post.status === "published"));

    const planData = {
        profile: ToonTemplates.bioEntity(bio),
        options,
        queueSnapshot: existingPosts
            .filter((post) => post.scheduledAt)
            .slice(0, 120)
            .map((post) => ({
                channel: post.channel,
                status: post.status,
                scheduledAt: post.scheduledAt,
            })),
        historicalHeatmap,
    };

    const bamlPrompt = buildBAMLPrompt("metadataGeneration", planData, {
        useTOON: true,
        context: {
            task: "social_queue_planning",
            schema: {
                queue: [
                    {
                        channel: "instagram|threads|facebook|linkedin|twitter",
                        title: "short title",
                        content: "post copy",
                        hashtags: ["tag1", "tag2"],
                        scheduledAt: "ISO datetime",
                        reason: "why this slot may get more views",
                        confidence: "1-100",
                    },
                ],
            },
            instructions: [
                "Return ONLY valid JSON.",
                "Respect postsCount and channel constraints.",
                "Prefer slots with higher chance of views based on historical + best practices.",
                "Avoid collisions with queueSnapshot and keep minGapHours between posts.",
                "Use timezone provided in options.",
            ],
        },
    });

    let aiQueue: PlannedQueuePost[] = [];

    try {
        const completion = await groqChatCompletion({
            messages: [
                {
                    role: "system",
                    content: `${bamlPrompt.system}\n\nYou are an elite social media planner focused on maximizing visibility with practical scheduling decisions.`,
                },
                {
                    role: "user",
                    content: bamlPrompt.user,
                },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.6,
            max_tokens: 4096,
            response_format: { type: "json_object" },
        });

        const responseContent = "choices" in completion
            ? completion.choices[0]?.message?.content
            : null;

        if (responseContent) {
            const parsed = JSON.parse(responseContent);
            aiQueue = parseQueueResponse(parsed);
        }
    } catch {
        aiQueue = [];
    }

    const sanitized = sanitizePlan(aiQueue, options, existingScheduleDates);
    const finalQueue = sanitized.length >= Math.max(1, Math.floor(options.postsCount * 0.6))
        ? sanitized
        : generateFallbackQueue(options, existingScheduleDates);

    return {
        options,
        queue: finalQueue,
        tokenSavings: bamlPrompt.tokenSavings || 0,
    };
};

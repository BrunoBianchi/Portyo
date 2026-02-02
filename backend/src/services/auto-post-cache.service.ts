import redisClient from "../config/redis.client";
import { logger } from "../shared/utils/logger";

const PREVIEW_CACHE_PREFIX = "autopost:preview:";
const PREVIEW_CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds
const METADATA_CACHE_PREFIX = "autopost:metadata:";
const METADATA_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

interface CachedPreview {
    generatedPost: any;
    configHash: string;
    createdAt: string;
}

interface CachedMetadata {
    keywords: string[];
    tags: string[];
    targetAudience: string;
    topics: string;
    createdAt: string;
}

/**
 * Generate a hash from the preview configuration
 * Used to cache previews based on identical config
 */
const generateConfigHash = (config: any): string => {
    const normalizedConfig = {
        topics: config.topics || "",
        keywords: Array.isArray(config.keywords) ? config.keywords.sort().join(",") : config.keywords || "",
        tone: config.tone || "professional",
        postLength: config.postLength || "medium",
        targetAudience: config.targetAudience || "",
        targetCountry: config.targetCountry || "",
        language: config.language || "",
    };
    
    // Simple hash function
    const str = JSON.stringify(normalizedConfig);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
};

/**
 * Get cached preview from Redis
 */
export const getCachedPreview = async (
    userId: string,
    bioId: string,
    config: any
): Promise<any | null> => {
    try {
        const configHash = generateConfigHash(config);
        const key = `${PREVIEW_CACHE_PREFIX}${userId}:${bioId}:${configHash}`;
        
        const cached = await redisClient.get(key);
        if (!cached) {
            return null;
        }

        const parsed: CachedPreview = JSON.parse(cached);
        
        // Verify config hash matches (extra safety)
        if (parsed.configHash !== configHash) {
            logger.warn("[AutoPostCache] Config hash mismatch, ignoring cache");
            return null;
        }

        logger.info(`[AutoPostCache] Cache hit for preview: ${key}`);
        return parsed.generatedPost;
    } catch (error) {
        logger.error("[AutoPostCache] Error getting cached preview:", error);
        return null;
    }
};

/**
 * Save preview to Redis cache
 */
export const setCachedPreview = async (
    userId: string,
    bioId: string,
    config: any,
    generatedPost: any
): Promise<void> => {
    try {
        const configHash = generateConfigHash(config);
        const key = `${PREVIEW_CACHE_PREFIX}${userId}:${bioId}:${configHash}`;
        
        const cacheData: CachedPreview = {
            generatedPost,
            configHash,
            createdAt: new Date().toISOString(),
        };

        await redisClient.set(key, JSON.stringify(cacheData), "EX", PREVIEW_CACHE_TTL);
        logger.info(`[AutoPostCache] Cached preview saved: ${key}`);
    } catch (error) {
        logger.error("[AutoPostCache] Error saving cached preview:", error);
    }
};

/**
 * Invalidate all previews for a user/bio
 */
export const invalidatePreviewCache = async (
    userId: string,
    bioId: string
): Promise<void> => {
    try {
        const pattern = `${PREVIEW_CACHE_PREFIX}${userId}:${bioId}:*`;
        
        // Get all matching keys
        const keys: string[] = [];
        let cursor = "0";
        
        do {
            const result = await redisClient.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = result[0];
            keys.push(...result[1]);
        } while (cursor !== "0");

        if (keys.length > 0) {
            await redisClient.del(...keys);
            logger.info(`[AutoPostCache] Invalidated ${keys.length} cached previews for ${userId}:${bioId}`);
        }
    } catch (error) {
        logger.error("[AutoPostCache] Error invalidating preview cache:", error);
    }
};

/**
 * Get cached metadata (keywords/tags/targetAudience) from Redis
 */
export const getCachedMetadata = async (
    userId: string,
    bioId: string,
    topics: string
): Promise<CachedMetadata | null> => {
    try {
        // Hash the topics to use as cache key
        const topicsHash = generateConfigHash({ topics });
        const key = `${METADATA_CACHE_PREFIX}${userId}:${bioId}:${topicsHash}`;
        
        const cached = await redisClient.get(key);
        if (!cached) {
            return null;
        }

        const parsed: CachedMetadata = JSON.parse(cached);
        logger.info(`[AutoPostCache] Cache hit for metadata: ${key}`);
        return parsed;
    } catch (error) {
        logger.error("[AutoPostCache] Error getting cached metadata:", error);
        return null;
    }
};

/**
 * Save metadata to Redis cache
 */
export const setCachedMetadata = async (
    userId: string,
    bioId: string,
    topics: string,
    metadata: Omit<CachedMetadata, "createdAt">
): Promise<void> => {
    try {
        const topicsHash = generateConfigHash({ topics });
        const key = `${METADATA_CACHE_PREFIX}${userId}:${bioId}:${topicsHash}`;
        
        const cacheData: CachedMetadata = {
            ...metadata,
            createdAt: new Date().toISOString(),
        };

        await redisClient.set(key, JSON.stringify(cacheData), "EX", METADATA_CACHE_TTL);
        logger.info(`[AutoPostCache] Cached metadata saved: ${key}`);
    } catch (error) {
        logger.error("[AutoPostCache] Error saving cached metadata:", error);
    }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async (): Promise<{
    previewKeys: number;
    metadataKeys: number;
}> => {
    try {
        const previewPattern = `${PREVIEW_CACHE_PREFIX}*`;
        const metadataPattern = `${METADATA_CACHE_PREFIX}*`;
        
        let previewKeys = 0;
        let metadataKeys = 0;
        
        // Count preview keys
        let cursor = "0";
        do {
            const result = await redisClient.scan(cursor, "MATCH", previewPattern, "COUNT", 100);
            cursor = result[0];
            previewKeys += result[1].length;
        } while (cursor !== "0");
        
        // Count metadata keys
        cursor = "0";
        do {
            const result = await redisClient.scan(cursor, "MATCH", metadataPattern, "COUNT", 100);
            cursor = result[0];
            metadataKeys += result[1].length;
        } while (cursor !== "0");
        
        return { previewKeys, metadataKeys };
    } catch (error) {
        logger.error("[AutoPostCache] Error getting cache stats:", error);
        return { previewKeys: 0, metadataKeys: 0 };
    }
};

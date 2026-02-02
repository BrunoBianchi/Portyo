import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import redisClient from "../config/redis.client";
import { logger } from "../shared/utils/logger";
import { isAdmin } from "../middlewares/admin.middleware";

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
    keyPrefix: string; // Redis key prefix
    message?: string; // Custom error message
}

interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: Date;
}

// In-memory fallback when Redis is unavailable
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

const cleanInMemoryStore = () => {
    const now = Date.now();
    for (const [key, value] of inMemoryStore.entries()) {
        if (now > value.resetTime) {
            inMemoryStore.delete(key);
        }
    }
};

// Clean every minute
setInterval(cleanInMemoryStore, 60000);

export const createRateLimiter = (config: RateLimitConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Get user ID from authenticated request
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const key = `${config.keyPrefix}:${userId}`;
        const now = Date.now();
        const windowStart = now - config.windowMs;

        try {
            let info: RateLimitInfo;

            // Try Redis first
            if (redisClient && typeof redisClient.get === "function") {
                try {
                    const current = await redisClient.get(key);
                    const resetTime = await redisClient.get(`${key}:reset`);

                    if (!current || !resetTime || parseInt(resetTime) < now) {
                        // New window
                        const newReset = now + config.windowMs;
                        const pipeline = redisClient.pipeline();
                        pipeline.set(key, "1", "PX", config.windowMs);
                        pipeline.set(`${key}:reset`, newReset.toString(), "PX", config.windowMs);
                        await pipeline.exec();

                        info = {
                            limit: config.maxRequests,
                            remaining: config.maxRequests - 1,
                            reset: new Date(newReset),
                        };
                    } else {
                        // Existing window
                        const count = parseInt(current);
                        if (count >= config.maxRequests) {
                            // Rate limit exceeded
                            const resetDate = new Date(parseInt(resetTime));
                            res.status(429).json({
                                error: config.message || "Too many requests",
                                retryAfter: Math.ceil((resetDate.getTime() - now) / 1000),
                                limit: config.maxRequests,
                                remaining: 0,
                                reset: resetDate.toISOString(),
                            });
                            return;
                        }

                        // Increment count
                        await redisClient.incr(key);
                        info = {
                            limit: config.maxRequests,
                            remaining: config.maxRequests - count - 1,
                            reset: new Date(parseInt(resetTime)),
                        };
                    }
                } catch (redisError) {
                    logger.warn("[RateLimit] Redis error, falling back to memory:", redisError);
                    info = await handleInMemoryRateLimit(key, config);
                }
            } else {
                // Use in-memory store
                info = await handleInMemoryRateLimit(key, config);
            }

            // Add rate limit headers
            res.setHeader("X-RateLimit-Limit", info.limit.toString());
            res.setHeader("X-RateLimit-Remaining", info.remaining.toString());
            res.setHeader("X-RateLimit-Reset", info.reset.toISOString());

            next();
        } catch (error) {
            logger.error("[RateLimit] Error:", error);
            // Fail open - allow request on error
            next();
        }
    };
};

const handleInMemoryRateLimit = async (
    key: string,
    config: RateLimitConfig
): Promise<RateLimitInfo> => {
    const now = Date.now();
    const entry = inMemoryStore.get(key);

    if (!entry || now > entry.resetTime) {
        // New window
        const newEntry = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        inMemoryStore.set(key, newEntry);

        return {
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: new Date(newEntry.resetTime),
        };
    }

    // Existing window
    if (entry.count >= config.maxRequests) {
        throw new Error("Rate limit exceeded");
    }

    entry.count++;
    inMemoryStore.set(key, entry);

    return {
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: new Date(entry.resetTime),
    };
};

// Pre-configured rate limiters for auto-post endpoints
export const autoPostRateLimiters = {
    // Preview generation: 5 per hour (expensive AI operation)
    preview: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5,
        keyPrefix: "ratelimit:autopost:preview",
        message: "Preview generation limit reached. Please try again later.",
    }),

    // Schedule creation/update: 10 per hour
    schedule: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,
        keyPrefix: "ratelimit:autopost:schedule",
        message: "Too many schedule changes. Please try again later.",
    }),

    // Summary generation: 3 per hour (expensive AI operation)
    summary: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        keyPrefix: "ratelimit:autopost:summary",
        message: "Summary generation limit reached. Please try again later.",
    }),

    // Metadata generation (tags/keywords): 10 per hour
    metadata: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,
        keyPrefix: "ratelimit:autopost:metadata",
        message: "Metadata generation limit reached. Please try again later.",
    }),

    // General auto-post API: 30 per minute
    general: createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30,
        keyPrefix: "ratelimit:autopost:general",
        message: "Too many requests. Please slow down.",
    }),
};

// Middleware to check if request should skip rate limiting (admin users)
export const skipRateLimitForAdmins = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (isAdmin(req.user?.email)) {
        // Skip rate limiting for admins
        next();
        return;
    }
    // Continue to rate limiter
    next();
};

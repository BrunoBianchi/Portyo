import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../shared/utils/logger";

// Allow hard-disable of Redis to keep the API alive when Redis is misconfigured
export const redisEnabled = !process.env.DISABLE_REDIS;

const createMockRedis = () => {
  // Minimal mock implementing the methods we use
  const pipeline = () => ({
    get: async () => null,
    set: async () => undefined,
    del: async () => undefined,
    exec: async () => [],
  });
  return {
    get: async () => null,
    set: async () => undefined,
    del: async () => undefined,
    getBuffer: async () => null,
    pipeline,
    on: () => undefined,
  } as any;
};

let redisClient: any;

if (redisEnabled) {
  const redisOptions: any = {
    host: env.REDIS_HOST || "localhost",
    port: env.REDIS_PORT || 6379,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  // Only add auth options if they are defined
  if (env.REDIS_PASSWORD) {
    redisOptions.password = env.REDIS_PASSWORD;
  }
  // Redis ACL username only makes sense with a password; avoid sending malformed AUTH.
  if (env.REDIS_USERNAME && env.REDIS_PASSWORD) {
    redisOptions.username = env.REDIS_USERNAME;
  }

  redisClient = new Redis(redisOptions);

  redisClient.on("connect", () => {
    logger.info("Redis client connected");
  });

  redisClient.on("error", (err: any) => {
    logger.error("Redis client error:", err.message, err.stack);
  });
} else {
  logger.warn("Redis disabled via DISABLE_REDIS; using in-memory no-op cache.");
  redisClient = createMockRedis();
}

export default redisClient;

import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../shared/utils/logger";
import { existsSync } from "fs";

// Redis enabled by default; can be turned off with DISABLE_REDIS=true if needed.
const redisEnabled = process.env.DISABLE_REDIS !== "true";

const createMockRedis = () => {
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
    zadd: async () => 0,
    zrangebyscore: async () => [],
    zrem: async () => 0,
    pipeline,
    on: () => undefined,
  } as any;
};

let redisClient: any;

if (redisEnabled) {
  const runningInDocker = existsSync("/.dockerenv");
  const resolvedRedisHost = !runningInDocker && env.REDIS_HOST === "redis"
    ? "localhost"
    : env.REDIS_HOST;

  const redisOptions: any = {
    host: resolvedRedisHost || "localhost",
    port: env.REDIS_PORT || 6379,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  if (env.REDIS_PASSWORD) {
    redisOptions.password = env.REDIS_PASSWORD;
  }
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

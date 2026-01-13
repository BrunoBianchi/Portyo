import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../shared/utils/logger";

const redisClient = new Redis({
  host: env.REDIS_HOST || "localhost",
  port: env.REDIS_PORT || 6379,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis client error:", err.message, err.stack);
});

export default redisClient;

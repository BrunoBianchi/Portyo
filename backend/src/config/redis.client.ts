import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../shared/utils/logger";

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

const redisClient = new Redis(redisOptions);

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis client error:", err.message, err.stack);
});

export default redisClient;

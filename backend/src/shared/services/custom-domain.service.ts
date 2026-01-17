import { AppDataSource } from "../../database/datasource";
import { BioEntity } from "../../database/entity/bio-entity";
import redisClient from "../../config/redis.client";

const CACHE_TTL_SECONDS = 300; // 5 minutes

const getHostname = (origin: string): string | null => {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return null;
  }
};

export const isCustomDomainAllowed = async (origin: string): Promise<boolean> => {
  const hostname = getHostname(origin);
  if (!hostname) return false;

  const cacheKey = `custom-domain:${hostname}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached === "1") return true;
    if (cached === "0") return false;
  } catch {
    // ignore cache errors
  }

  try {
    const repository = AppDataSource.getRepository(BioEntity);
    const record = await repository.findOne({ where: { customDomain: hostname }, select: ["id"] });
    const allowed = !!record;

    try {
      await redisClient.set(cacheKey, allowed ? "1" : "0", "EX", CACHE_TTL_SECONDS);
    } catch {
      // ignore cache errors
    }

    return allowed;
  } catch {
    return false;
  }
};

import { Router } from "express";
import redisClient from "../../../config/redis.client";
import { logger } from "../../../shared/utils/logger";

const router = Router();

router.get("/:userId/:fontId/:extension", async (req, res) => {
    try {
        const { userId, fontId, extension } = req.params;
        
        const key = `user:${userId}:font:${fontId}`;
        
        const fontBuffer = await redisClient.getBuffer(key);

        if (!fontBuffer) {
            return res.status(404).json({ message: "Font not found" });
        }

        let contentType = 'font/ttf';
        if (extension === 'woff') contentType = 'font/woff';
        if (extension === 'woff2') contentType = 'font/woff2';
        if (extension === 'otf') contentType = 'font/otf';

        res.set("Content-Type", contentType);
        res.set("Cache-Control", "public, max-age=31536000"); // Long caching
        res.set("Access-Control-Allow-Origin", "*"); // Allow fonts to be loaded from anywhere (CORS)
        return res.send(fontBuffer);

    } catch (error) {
        logger.error("Error serving font from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

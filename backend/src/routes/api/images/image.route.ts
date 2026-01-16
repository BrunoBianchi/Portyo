import { Router } from "express";
import redisClient from "../../../config/redis.client";
import { logger } from "../../../shared/utils/logger";

const router = Router();

// Cache control: no-cache - we want the browser to always revalidate with the server (ETag)
// because the URL stays the same even if the content changes (user uploads new photo).
const CACHE_CONTROL = "no-cache, must-revalidate, max-age=0";

router.get("/blog/:userId/:imageId/:filename", async (req, res) => {
    try {
        const { userId, imageId, filename } = req.params;
        
        // Remove file extension (e.g., full.png -> full)
        const size = filename.split('.')[0];
        
        // Validate size
        if (!['list', 'full'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `user:${userId}:blog:${imageId}:${size}`;
        
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=31536000"); // Long caching for blog images as they have unique IDs
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving blog image from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/product/:userId/:imageId/:filename", async (req, res) => {
    try {
        const { userId, imageId, filename } = req.params;
        
        // Remove file extension (e.g., full.png -> full)
        const size = filename.split('.')[0];
        
        // Validate size
        if (!['full'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `user:${userId}:product:${imageId}:${size}`;
        
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving product image from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/block/:userId/:imageId/:filename", async (req, res) => {
    try {
        const { userId, imageId, filename } = req.params;
        
        // Remove file extension (e.g., full.png -> full)
        const size = filename.split('.')[0];
        
        // Validate size
        if (!['full'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `user:${userId}:block:${imageId}:${size}`;
        
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving block image from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/favicon/:userId/:imageId/:filename", async (req, res) => {
    try {
        const { userId, imageId, filename } = req.params;
        
        const size = filename.split('.')[0];
        
        if (!['full'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `user:${userId}:favicon:${imageId}:${size}`;
        
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving favicon from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/og/:userId/:imageId/:filename", async (req, res) => {
    try {
        const { userId, imageId, filename } = req.params;
        
        const size = filename.split('.')[0];
        
        if (!['full'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `user:${userId}:og:${imageId}:${size}`;
        
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving OG image from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/portfolio/:userId/:imageId/:filename", async (req, res) => {
    try {
        const { userId, imageId, filename } = req.params;
        
        const size = filename.split('.')[0];
        
        if (!['full'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `user:${userId}:portfolio:${imageId}:${size}`;
        
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving portfolio image from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:userId/:filename", async (req, res) => {
    try {
        const { userId, filename } = req.params;
        
        // Remove file extension if present (e.g., medium.png -> medium)
        const size = filename.split('.')[0];
        
        // Validate size to prevent arbitrary key access
        if (!['thumbnail', 'medium', 'original'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `user:${userId}:photo:${size}`;
        
        // ioredis returns Buffer if returnBuffer: true is set or we use getBuffer
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", CACHE_CONTROL);
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving image from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/bio-logo/:bioId/:imageId/:filename", async (req, res) => {
    try {
        const { bioId, imageId, filename } = req.params;
        
        const size = filename.split('.')[0];
        
        if (!['full'].includes(size)) {
            return res.status(400).json({ message: "Invalid image size" });
        }

        const key = `bio:${bioId}:logo:${imageId}:${size}`;
        
        const imageBuffer = await redisClient.getBuffer(key);

        if (!imageBuffer) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=31536000");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(imageBuffer);

    } catch (error) {
        logger.error("Error serving bio logo from Redis:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

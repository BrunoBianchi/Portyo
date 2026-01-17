import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import sharp from "sharp";
import redisClient from "../../../config/redis.client";
import { logger } from "../../../shared/utils/logger";

const router = Router();

// Cache control: no-cache - we want the browser to always revalidate with the server (ETag)
// because the URL stays the same even if the content changes (user uploads new photo).
const CACHE_CONTROL = "no-cache, must-revalidate, max-age=0";

const guessPublicDir = () => {
    const candidates = [
        path.resolve(process.cwd(), "../frontend/public"),
        path.resolve(process.cwd(), "frontend/public"),
        path.resolve(__dirname, "../../../../frontend/public")
    ];

    return candidates.find((candidate) => existsSync(candidate)) || candidates[0];
};

const PUBLIC_DIR = guessPublicDir();
const ALLOWED_PUBLIC_PATHS = ["/users-photos/", "/icons/"];

router.get("/optimize", async (req, res) => {
    try {
        const imagePath = typeof req.query.path === "string" ? req.query.path : "";

        if (!imagePath || !ALLOWED_PUBLIC_PATHS.some((prefix) => imagePath.startsWith(prefix))) {
            return res.status(400).json({ message: "Invalid image path" });
        }

        const width = req.query.w ? Number(req.query.w) : undefined;
        const height = req.query.h ? Number(req.query.h) : undefined;
        const quality = req.query.q ? Number(req.query.q) : undefined;
        const formatParam = typeof req.query.format === "string" ? req.query.format : undefined;

        if ((width && (!Number.isFinite(width) || width <= 0)) || (height && (!Number.isFinite(height) || height <= 0))) {
            return res.status(400).json({ message: "Invalid width/height" });
        }

        const resolvedPath = path.resolve(PUBLIC_DIR, `.${imagePath}`);
        if (!resolvedPath.startsWith(PUBLIC_DIR)) {
            return res.status(400).json({ message: "Invalid image path" });
        }

        const buffer = await fs.readFile(resolvedPath);

        let transformer = sharp(buffer).rotate();
        if (width || height) {
            transformer = transformer.resize({
                width,
                height,
                fit: "cover",
                withoutEnlargement: true
            });
        }

        const accept = req.headers.accept || "";
        const preferredFormat = formatParam || (accept.includes("image/avif") ? "avif" : accept.includes("image/webp") ? "webp" : "png");

        let contentType = "image/png";
        switch (preferredFormat) {
            case "avif":
                transformer = transformer.avif({ quality: Number.isFinite(quality) ? quality : 45 });
                contentType = "image/avif";
                break;
            case "webp":
                transformer = transformer.webp({ quality: Number.isFinite(quality) ? quality : 78 });
                contentType = "image/webp";
                break;
            case "jpg":
            case "jpeg":
                transformer = transformer.jpeg({ quality: Number.isFinite(quality) ? quality : 78, mozjpeg: true });
                contentType = "image/jpeg";
                break;
            case "png":
            default:
                transformer = transformer.png();
                contentType = "image/png";
                break;
        }

        const output = await transformer.toBuffer();
        res.set("Content-Type", contentType);
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        return res.send(output);
    } catch (error) {
        logger.error("Error optimizing public image:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

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

import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { processBlockImage } from "../../../services/image.service";
import { env } from "../../../config/env";
import { logger } from "../../../shared/utils/logger";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 30 * 1024 * 1024, // 30MB limit
    },
});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Process block image and store in Redis
        const imageUrl = await processBlockImage(req.file, userId, env.BACKEND_URL);

        logger.info(`Block image uploaded for user ${userId}`);

        return res.json({
            url: imageUrl
        });

    } catch (error) {
        logger.error("Error uploading block image:", error);
        return res.status(500).json({ message: "Failed to upload image" });
    }
});

export default router;

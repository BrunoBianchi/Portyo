import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { processBioLogoImage } from "../../../services/image.service";
import { env } from "../../../config/env";
import { logger } from "../../../shared/utils/logger";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit
    },
});

router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const bioId = req.body.bioId;
        if (!bioId) {
            return res.status(400).json({ message: "Bio ID is required" });
        }

        // Process bio logo image and store in Redis
        const imageUrl = await processBioLogoImage(req.file, userId, bioId, env.BACKEND_URL);

        logger.info(`Bio logo uploaded for user ${userId}, bio ${bioId}`);

        return res.json({
            url: imageUrl,
            // Compatible with legacy profile upload response if needed
            medium: imageUrl
        });

    } catch (error) {
        logger.error("Error uploading bio logo:", error);
        return res.status(500).json({ message: "Failed to upload image" });
    }
});

export default router;

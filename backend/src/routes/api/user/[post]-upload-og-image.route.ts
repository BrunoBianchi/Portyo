import { Router } from "express";
import multer from "multer";
import { processOgImage } from "../../../services/image.service";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB max
    },
});

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const url = await processOgImage(req.file, userId, baseUrl);
        
        return res.status(200).json({ url });
    } catch (error) {
        console.error("OG Image upload error:", error);
        return res.status(500).json({ message: "Failed to process image" });
    }
});

export default router;

import { Router } from "express";
import multer from "multer";
import { processBlogThumbnail } from "../../../services/image.service";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAuth, upload.single("thumbnail"), async (req, res) => {
    console.log("[BlogUpload] Request received");
    try {
        if (!req.file) {
            console.log("[BlogUpload] No file in request");
            return res.status(400).json({ message: "No file uploaded" });
        }
        console.log("[BlogUpload] File received:", req.file.originalname, req.file.size);

        const userId = req.user?.id;
        if (!userId) {
            console.log("[BlogUpload] No user ID");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        console.log("[BlogUpload] Processing thumbnail...");
        const thumbnailUrl = await processBlogThumbnail(req.file, userId, baseUrl);
        console.log("[BlogUpload] Success, URL:", thumbnailUrl);
        
        return res.status(200).json({ url: thumbnailUrl });
    } catch (error) {
        console.error("[BlogUpload] Error:", error);
        return res.status(500).json({ message: "Failed to process thumbnail" });
    }
});

export default router;

import { Router } from "express";
import multer from "multer";
import { processProfileImage } from "../../../services/image.service";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 30 * 1024 * 1024, // 30MB max
    },
});

// parent router mounts at /user/upload-photo; use root path here
router.post("/", requireAuth, upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const paths = await processProfileImage(req.file, userId, baseUrl);
        
        // Here you would typically update the user entity with the new photo URL
        // For now, we just return the paths
        
        return res.status(200).json(paths);
    } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({ message: "Failed to process image" });
    }
});

export default router;

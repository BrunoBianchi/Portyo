import { Router } from "express";
import multer from "multer";
import { processCustomFont } from "../../../services/image.service";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max for fonts (some can be large)
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'font/ttf' || 
            file.mimetype === 'font/otf' || 
            file.mimetype === 'font/woff' || 
            file.mimetype === 'font/woff2' ||
            file.originalname.match(/\.(ttf|otf|woff|woff2)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid font file type'));
        }
    }
});

router.post("/", requireAuth, upload.single("font"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fontUrl = await processCustomFont(req.file, userId, baseUrl);
        
        return res.status(200).json({ url: fontUrl, name: req.file.originalname });
    } catch (error) {
        console.error("Font upload error:", error);
        return res.status(500).json({ message: "Failed to process font" });
    }
});

export default router;

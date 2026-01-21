import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { parseResume } from "../../../services/resume.service";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});

router.post("/upload-resume", authMiddleware, upload.single("resume"), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(APIErrors.validationError, "No file uploaded", 400);
        }

        const resumeText = await parseResume(req.file.buffer);

        res.status(200).json({
            success: true,
            resumeText: resumeText,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

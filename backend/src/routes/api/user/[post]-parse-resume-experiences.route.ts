import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { parseResume } from "../../../services/resume.service";
import { extractExperiencesFromResume } from "../../../services/ai.service";
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

router.post("/parse-resume-experiences", authMiddleware, upload.single("resume"), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(APIErrors.validationError, "No file uploaded", 400);
        }

        // 1. Parse PDF text
        const resumeText = await parseResume(req.file.buffer);

        if (!resumeText || resumeText.trim().length === 0) {
             throw new ApiError(APIErrors.validationError, "Could not extract text from resume", 400);
        }

        // 2. Extract experiences using AI
        const experiences = await extractExperiencesFromResume(resumeText);

        res.status(200).json({
            success: true,
            experiences: experiences,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

import { Router } from "express";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { generateBioFromOnboarding, getDefaultBlocks, OnboardingAnswers } from "../../../services/ai.service";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

const onboardingSchema = z.object({
    aboutYou: z.string().min(1, "Por favor, descreva sobre você"),
    education: z.object({
        hasGraduation: z.boolean(),
        degree: z.string().optional(),
    }),
    profession: z.string().min(1, "Por favor, informe sua profissão"),
    skills: z.array(z.string()),
    goals: z.string().min(1, "Por favor, informe seu objetivo"),
});

router.post("/generate-bio", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(APIErrors.unauthorizedError, "User not authenticated", 401);
        }

        const answers: OnboardingAnswers = onboardingSchema.parse(req.body);

        const userRepository = AppDataSource.getRepository(UserEntity);
        const bioRepository = AppDataSource.getRepository(BioEntity);

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found", 404);
        }

        // Get user's first bio
        const bio = await bioRepository.findOne({ 
            where: { userId },
            order: { createdAt: 'ASC' }
        });

        if (!bio) {
            throw new ApiError(APIErrors.notFoundError, "Bio not found. Please create a bio first.", 404);
        }

        // Generate blocks using AI
        let generatedBlocks;
        try {
            generatedBlocks = await generateBioFromOnboarding(answers);
        } catch (aiError) {
            console.error("AI generation failed, using default blocks:", aiError);
            generatedBlocks = getDefaultBlocks(user.fullName);
        }

        // Update bio with generated blocks
        bio.blocks = generatedBlocks;
        bio.description = answers.aboutYou;
        await bioRepository.save(bio);

        // Mark onboarding as completed
        user.onboardingCompleted = true;
        await userRepository.save(user);

        res.status(200).json({
            success: true,
            message: "Bio generated successfully",
            blocks: generatedBlocks,
            bioId: bio.id,
        });
    } catch (error) {
        next(error);
    }
});

// Skip onboarding endpoint
router.post("/skip", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(APIErrors.unauthorizedError, "User not authenticated", 401);
        }

        const userRepository = AppDataSource.getRepository(UserEntity);
        
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found", 404);
        }

        // Mark onboarding as completed (skipped)
        user.onboardingCompleted = true;
        await userRepository.save(user);

        res.status(200).json({
            success: true,
            message: "Onboarding skipped",
        });
    } catch (error) {
        next(error);
    }
});

// Generate content from prompt (AI Assistant)
router.post("/generate-content", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(APIErrors.unauthorizedError, "User not authenticated", 401);
        }

        const { prompt } = z.object({
            prompt: z.string().min(1, "Prompt is required"),
        }).parse(req.body);

        const { generateContentFromPrompt } = await import("../../../services/ai.service");
        
        const result = await generateContentFromPrompt(prompt);

        res.status(200).json({
            success: true,
            blocks: result.blocks,
            settings: result.settings,
            replaceBlocks: result.replaceBlocks,
            globalBlockStyles: result.globalBlockStyles,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

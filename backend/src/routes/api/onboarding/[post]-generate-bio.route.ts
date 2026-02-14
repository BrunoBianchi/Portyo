import { Router } from "express";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { generateBioFromOnboarding, getDefaultBlocks, OnboardingAnswers, buildProfessionalAboutSummary } from "../../../services/ai.service";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

const onboardingSchema = z.object({
    username: z.string().min(3).max(40).optional(),
    theme: z.object({
        name: z.string().optional(),
        styles: z.object({
            bgType: z.string().optional(),
            bgColor: z.string().optional(),
            bgSecondaryColor: z.string().optional(),
            cardStyle: z.string().optional(),
            cardBackgroundColor: z.string().optional(),
            cardBorderColor: z.string().optional(),
            cardBorderWidth: z.number().optional(),
            cardBorderRadius: z.number().optional(),
            cardShadow: z.string().optional(),
            cardPadding: z.number().optional(),
            cardOpacity: z.number().optional(),
            cardBlur: z.number().optional(),
            usernameColor: z.string().optional(),
            font: z.string().optional(),
            maxWidth: z.number().optional(),
            imageStyle: z.string().optional(),
            enableParallax: z.boolean().optional(),
            parallaxIntensity: z.number().optional(),
            parallaxDepth: z.number().optional(),
            floatingElements: z.boolean().optional(),
            floatingElementsType: z.string().optional(),
            floatingElementsColor: z.string().optional(),
            floatingElementsDensity: z.number().optional(),
            floatingElementsSize: z.number().optional(),
            floatingElementsSpeed: z.number().optional(),
            floatingElementsOpacity: z.number().optional(),
            floatingElementsBlur: z.number().optional(),
        }).optional(),
    }).optional().nullable(),
    aboutYou: z.string().min(1, "Por favor, descreva sobre você"),
    education: z.object({
        hasGraduation: z.boolean(),
        degree: z.string().optional(),
        universityName: z.string().optional(),
        courseName: z.string().optional(),
    }),
    profession: z.string().min(1, "Por favor, informe sua profissão"),
    skills: z.array(z.string()),
    goals: z.union([
        z.array(z.string()).min(1, "Por favor, informe seu objetivo"),
        z.string().min(1, "Por favor, informe seu objetivo")
    ]),
    resumeText: z.string().optional(),
});

router.post("/generate-bio", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(APIErrors.unauthorizedError, "User not authenticated", 401);
        }

        const rawAnswers = onboardingSchema.parse(req.body);
        const normalizedGoals = Array.isArray(rawAnswers.goals)
            ? rawAnswers.goals
            : [rawAnswers.goals];

        const answers: OnboardingAnswers = {
            ...rawAnswers,
            goals: normalizedGoals,
        };

        const userRepository = AppDataSource.getRepository(UserEntity);
        const bioRepository = AppDataSource.getRepository(BioEntity);

        const normalizeSufix = (value: string): string =>
            value
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9._-]/g, "")
                .replace(/^[-._]+|[-._]+$/g, "")
                .slice(0, 40);

        const ensureUniqueSufix = async (baseValue: string): Promise<string> => {
            const base = normalizeSufix(baseValue) || "portyo-user";

            for (let attempt = 0; attempt < 50; attempt++) {
                const candidate = attempt === 0 ? base : `${base}${attempt}`;
                const exists = await bioRepository.findOne({ where: { sufix: candidate } });
                if (!exists) {
                    return candidate;
                }
            }

            return `${base}${Date.now().toString().slice(-5)}`;
        };

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found", 404);
        }

        // Get user's first bio
        let bio = await bioRepository.findOne({ 
            where: { userId },
            order: { createdAt: 'ASC' }
        });

        if (!bio) {
            const preferredSufix = rawAnswers.username || user.fullName || `user-${user.id.slice(0, 6)}`;
            const uniqueSufix = await ensureUniqueSufix(preferredSufix);

            bio = bioRepository.create({
                sufix: uniqueSufix,
                user,
                blocks: [],
                description: null,
            });

            bio = await bioRepository.save(bio);
        }

        // Generate blocks using AI
        let generatedResult: Awaited<ReturnType<typeof generateBioFromOnboarding>> | ReturnType<typeof getDefaultBlocks>;
        const fallbackAboutSummary = buildProfessionalAboutSummary(answers);
        try {
            generatedResult = await generateBioFromOnboarding(answers);
        } catch (aiError) {
            console.error("AI generation failed, using default blocks:", aiError);
            generatedResult = {
                ...getDefaultBlocks(user.fullName),
                aboutSummary: fallbackAboutSummary,
            };
        }

        const { blocks, settings } = generatedResult;
        const aboutSummary =
            "aboutSummary" in generatedResult && typeof generatedResult.aboutSummary === "string"
                ? generatedResult.aboutSummary
                : fallbackAboutSummary;

        // Update bio with generated blocks and settings
        bio.blocks = blocks;
        bio.description = aboutSummary;

        // Apply settings to bio entity
        if (settings) {
            if (settings.bgType) bio.bgType = settings.bgType;
            if (settings.bgColor) bio.bgColor = settings.bgColor;
            if (settings.bgSecondaryColor) bio.bgSecondaryColor = settings.bgSecondaryColor;
            if (settings.usernameColor) bio.usernameColor = settings.usernameColor;
            if (settings.font) bio.font = settings.font;
            if (settings.cardStyle) bio.cardStyle = settings.cardStyle;
            if (settings.cardBackgroundColor) bio.cardBackgroundColor = settings.cardBackgroundColor;
            if (settings.cardBorderColor) bio.cardBorderColor = settings.cardBorderColor;
            if (typeof settings.cardBorderWidth === "number") bio.cardBorderWidth = settings.cardBorderWidth;
            if (typeof settings.cardBorderRadius === "number") bio.cardBorderRadius = settings.cardBorderRadius;
            if (settings.cardShadow) bio.cardShadow = settings.cardShadow;
            if (typeof settings.cardPadding === "number") bio.cardPadding = settings.cardPadding;
            if (typeof settings.cardOpacity === "number") bio.cardOpacity = settings.cardOpacity;
            if (typeof settings.cardBlur === "number") bio.cardBlur = settings.cardBlur;
            if (typeof settings.maxWidth === "number") bio.maxWidth = settings.maxWidth;
            if (settings.imageStyle) bio.imageStyle = settings.imageStyle;
            if (typeof settings.enableParallax === "boolean") bio.enableParallax = settings.enableParallax;
            if (typeof settings.parallaxIntensity === "number") bio.parallaxIntensity = settings.parallaxIntensity;
            if (typeof settings.parallaxDepth === "number") bio.parallaxDepth = settings.parallaxDepth;
            if (typeof settings.floatingElements === "boolean") bio.floatingElements = settings.floatingElements;
            if (settings.floatingElementsType) bio.floatingElementsType = settings.floatingElementsType;
            if (settings.floatingElementsColor) bio.floatingElementsColor = settings.floatingElementsColor;
            if (typeof settings.floatingElementsDensity === "number") bio.floatingElementsDensity = settings.floatingElementsDensity;
            if (typeof settings.floatingElementsSize === "number") bio.floatingElementsSize = settings.floatingElementsSize;
            if (typeof settings.floatingElementsSpeed === "number") bio.floatingElementsSpeed = settings.floatingElementsSpeed;
            if (typeof settings.floatingElementsOpacity === "number") bio.floatingElementsOpacity = settings.floatingElementsOpacity;
            if (typeof settings.floatingElementsBlur === "number") bio.floatingElementsBlur = settings.floatingElementsBlur;
        }

        await bioRepository.save(bio);

        // Mark onboarding as completed
        user.onboardingCompleted = true;
        await userRepository.save(user);

        res.status(200).json({
            success: true,
            message: "Bio generated successfully",
            blocks: blocks,
            settings: settings,
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

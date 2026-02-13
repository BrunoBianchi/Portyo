import { Router } from "express";
import { AppDataSource } from "../../../database/datasource";
import { ThemeEntity } from "../../../database/entity/theme-entity";
import { BioEntity } from "../../../database/entity/bio-entity";
import { UserEntity } from "../../../database/entity/user-entity";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { THEME_PRESETS } from "../../../seed-themes";
import { buildDefaultProfileImage } from "../../../shared/services/bio.service";

const router: Router = Router();
const themeRepository = AppDataSource.getRepository(ThemeEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

const ensureThemesSeeded = async () => {
    const existingThemes = await themeRepository.find({ select: ["id", "name", "isActive"] });
    const existingByName = new Map(
        existingThemes.map((theme) => [theme.name.trim().toLowerCase(), theme])
    );

    for (const preset of THEME_PRESETS) {
        const normalizedName = preset.name.trim().toLowerCase();
        const existingTheme = existingByName.get(normalizedName);
        if (existingTheme) {
            if (!existingTheme.isActive) {
                await themeRepository.update({ id: existingTheme.id }, { isActive: true });
            }
            continue;
        }

        const theme = themeRepository.create({
            name: preset.name,
            description: preset.description,
            category: preset.category as any,
            tier: preset.tier as any,
            emoji: preset.emoji,
            styles: preset.styles,
            sampleBlocks: (preset as any).sampleBlocks ?? null,
            usageCount: 0,
            isActive: true
        });

        await themeRepository.save(theme);
    }
};

const getPresetByThemeId = (themeId: string) => {
    const normalizedSlug = themeId.trim().toLowerCase();
    const normalizedName = themeId.replace(/-/g, " ").trim().toLowerCase();

    return THEME_PRESETS.find((preset) => {
        const presetName = preset.name.trim().toLowerCase();
        const presetSlug = presetName.replace(/\s+/g, "-");
        return presetSlug === normalizedSlug || presetName === normalizedName;
    });
};

// Tier hierarchy for access control
const tierHierarchy: Record<string, string[]> = {
    free: ["free"],
    standard: ["free", "standard"],
    pro: ["free", "standard", "pro"]
};

// Get all themes with optional filters
router.get("/", async (req, res) => {
    try {
        await ensureThemesSeeded();
        const { category, tier, search, sort } = req.query;
        
        let queryBuilder = themeRepository.createQueryBuilder("theme")
            .where("theme.isActive = :isActive", { isActive: true });
        
        if (category && category !== "all") {
            queryBuilder = queryBuilder.andWhere("theme.category = :category", { category });
        }
        
        if (tier && tier !== "all") {
            queryBuilder = queryBuilder.andWhere("theme.tier = :tier", { tier });
        }
        
        if (search) {
            queryBuilder = queryBuilder.andWhere(
                "(LOWER(theme.name) LIKE LOWER(:search) OR LOWER(theme.description) LIKE LOWER(:search))",
                { search: `%${search}%` }
            );
        }
        
        // Sort options
        if (sort === "popular") {
            queryBuilder = queryBuilder.orderBy("theme.usageCount", "DESC");
        } else if (sort === "newest") {
            queryBuilder = queryBuilder.orderBy("theme.createdAt", "DESC");
        } else {
            queryBuilder = queryBuilder.orderBy("theme.name", "ASC");
        }
        
        const themes = await queryBuilder.getMany();
        return res.json(themes);
    } catch (error) {
        console.error("Error fetching themes:", error);
        return res.status(500).json({ error: "Failed to fetch themes" });
    }
});

// Get available categories
router.get("/categories", async (_req, res) => {
    const categories = [
        { id: "architecture", name: "Architecture", emoji: "🏛️" },
        { id: "programming", name: "Programming", emoji: "💻" },
        { id: "onlyfans", name: "OnlyFans", emoji: "🔥" },
        { id: "photography", name: "Photography", emoji: "📸" },
        { id: "music", name: "Music", emoji: "🎵" },
        { id: "fitness", name: "Fitness", emoji: "💪" },
        { id: "fashion", name: "Fashion", emoji: "👗" },
        { id: "art", name: "Art", emoji: "🎨" },
        { id: "business", name: "Business", emoji: "💼" },
        { id: "gaming", name: "Gaming", emoji: "🎮" },
        { id: "food", name: "Food", emoji: "🍕" },
        { id: "travel", name: "Travel", emoji: "✈️" }
    ];
    
    return res.json(categories);
});

// Get single theme by ID or slug
router.get("/:id", async (req, res) => {
    try {
        const { id: themeId } = req.params;
        
        // First try to find by UUID
        let theme: ThemeEntity | null = null;
        const isUuid = typeof themeId === "string"
            && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId);
        
        if (isUuid) {
            theme = await themeRepository.findOne({
                where: { id: themeId, isActive: true }
            });
        }
        
        // Try to find by name/slug
        if (!theme && typeof themeId === "string") {
            const normalizedName = themeId.replace(/-/g, " ").toLowerCase();
            theme = await themeRepository
                .createQueryBuilder("theme")
                .where("theme.isActive = :isActive", { isActive: true })
                .andWhere("LOWER(theme.name) = :name", { name: normalizedName })
                .getOne();
        }
        
        // If still not found, try to create from preset
        if (!theme && typeof themeId === "string") {
            const preset = getPresetByThemeId(themeId);
            if (preset) {
                const createdTheme = themeRepository.create({
                    name: preset.name,
                    description: preset.description,
                    category: preset.category as any,
                    tier: preset.tier as any,
                    emoji: preset.emoji,
                    styles: preset.styles,
                    sampleBlocks: (preset as any).sampleBlocks ?? null,
                    usageCount: 0,
                    isActive: true
                });

                theme = await themeRepository.save(createdTheme);
            }
        }

        if (!theme) {
            return res.status(404).json({ error: "Theme not found" });
        }
        
        return res.json(theme);
    } catch (error) {
        console.error("Error fetching theme:", error);
        return res.status(500).json({ error: "Failed to fetch theme" });
    }
});

// Apply theme to bio (requires auth)
router.post("/apply", authMiddleware, async (req: any, res) => {
    try {
        await ensureThemesSeeded();
        const { themeId, bioId, customizations } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        // Get user and their plan
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Get theme by UUID or slug/name
        let theme: ThemeEntity | null = null;
        const isUuid = typeof themeId === "string"
            && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId);
        if (isUuid) {
            theme = await themeRepository.findOne({
                where: { id: themeId, isActive: true }
            });
        }
        if (!theme && typeof themeId === "string") {
            const normalizedName = themeId.replace(/-/g, " ").toLowerCase();
            theme = await themeRepository
                .createQueryBuilder("theme")
                .where("theme.isActive = :isActive", { isActive: true })
                .andWhere("LOWER(theme.name) = :name", { name: normalizedName })
                .getOne();
        }
        
        if (!theme) {
            return res.status(404).json({ error: "Theme not found" });
        }
        
        // Check tier access
        const userPlan = (user.plan || "free") as string;
        const allowedTiers = tierHierarchy[userPlan] || tierHierarchy.free;
        
        if (!allowedTiers.includes(theme.tier)) {
            return res.status(403).json({ 
                error: "Upgrade required",
                requiredTier: theme.tier,
                currentPlan: userPlan
            });
        }
        
        let bio: BioEntity | null = null;
        
        if (bioId) {
            // Apply to existing bio
            bio = await bioRepository.findOne({
                where: { id: bioId, userId }
            });
            
            if (!bio) {
                return res.status(404).json({ error: "Bio not found" });
            }
        } else {
            // Create new bio with theme
            const generatedSufix = `my-bio-${Date.now()}`;
            bio = bioRepository.create({
                sufix: generatedSufix,
                userId,
                html: "",
                blocks: theme.sampleBlocks || [],
                profileImage: buildDefaultProfileImage(generatedSufix)
            });
        }
        
        // Apply theme styles (with optional customizations override)
        const finalStyles = { ...theme.styles, ...customizations } as Record<string, any>;

        const styleKeys = [
            "bgType",
            "bgColor",
            "bgSecondaryColor",
            "bgImage",
            "bgVideo",
            "cardStyle",
            "cardBackgroundColor",
            "cardOpacity",
            "cardBlur",
            "cardBorderColor",
            "cardBorderWidth",
            "cardBorderRadius",
            "cardShadow",
            "cardPadding",
            "usernameColor",
            "font",
            "maxWidth",
            "customFontUrl",
            "customFontName",
            "enableParallax",
            "parallaxIntensity",
            "parallaxDepth",
            "parallaxAxis",
            "parallaxLayers",
            "floatingElements",
            "floatingElementsDensity",
            "floatingElementsSize",
            "floatingElementsSpeed",
            "floatingElementsOpacity",
            "floatingElementsBlur",
            "removeBranding"
        ] as const;

        styleKeys.forEach((key) => {
            if (finalStyles[key] !== undefined) {
                (bio as any)[key] = finalStyles[key];
            }
        });
        
        // Save bio
        await bioRepository.save(bio);
        
        // Increment theme usage count
        await themeRepository.increment({ id: theme.id }, "usageCount", 1);
        
        return res.json({
            success: true,
            bio,
            message: bioId ? "Theme applied successfully" : "New bio created with theme"
        });
    } catch (error) {
        console.error("Error applying theme:", error);
        return res.status(500).json({ error: "Failed to apply theme" });
    }
});

export default router;

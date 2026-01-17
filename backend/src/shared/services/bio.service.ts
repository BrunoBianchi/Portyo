import { AppDataSource } from "../../database/datasource"
import { BioEntity } from "../../database/entity/bio-entity"
import { UserEntity } from "../../database/entity/user-entity"
import { ApiError, APIErrors } from "../errors/api-error"
import { Bio } from "../types/bio.type"
import { findUserByEmail, findUserById } from "./user.service"
import { PLAN_LIMITS, PlanType } from "../constants/plan-limits"
import { BillingService } from "../../services/billing.service"
import redisClient from "../../config/redis.client"

const repository = AppDataSource.getRepository(BioEntity)

// ==================== Types ====================

export interface BackgroundSettings {
    bgType?: string;
    bgColor?: string;
    bgSecondaryColor?: string;
    bgImage?: string;
    bgVideo?: string;
    usernameColor?: string;
    imageStyle?: string;
    description?: string;
    socials?: any;
    displayProfileImage?: boolean;
    profileImage?: string;
}

export interface SeoSettings {
    seoTitle?: string;
    seoDescription?: string;
    favicon?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    seoKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
}

export interface LayoutSettings {
    cardStyle?: string;
    cardBackgroundColor?: string;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardBorderRadius?: number;
    cardShadow?: string;
    cardPadding?: number;
    maxWidth?: number;
}

export interface UpdateBioOptions {
    html?: string;
    blocks?: any[];
    bgSettings?: BackgroundSettings;
    seoSettings?: SeoSettings;
    customDomain?: string;
    layoutSettings?: LayoutSettings;
    enableSubscribeButton?: boolean;
    removeBranding?: boolean;
    profileImage?: string;
    font?: string;
    customFontUrl?: string;
    customFontName?: string;
}

import { env } from "../../config/env"
// ... existing code ...

const normalizeBio = (bio: BioEntity | null): Bio | null => {
    if (!bio) return null;
    if (!bio.profileImage && bio.userId) {
        bio.profileImage = `${env.BACKEND_URL}/api/images/${bio.userId}/medium.png`;
    }
    return bio as unknown as Bio;
}

// ==================== Query Functions ====================

export const findBioBySufixWithUser = async (sufix: string): Promise<Bio | null> => { 
        const bio = await repository.findOne({ 
            where:{
                sufix
            },
            relations:['user']
        });
        return normalizeBio(bio);
}

export const findBioByCustomDomain = async (customDomain: string): Promise<Bio | null> => { 
    const bio = await repository.findOne({ 
        where:{
            customDomain
        },
        relations:['user']
    });
    return normalizeBio(bio);
}

export const findBioBySufix = async (sufix: string): Promise<Bio | null> => {
    const bio = await repository.findOneBy({ sufix });
    // findOneBy doesn't load relations, so userId might be missing if not eager loaded.
    // However, bio entity usually has userId column. 
    return normalizeBio(bio);
}
export const findBioById= async (id: string,relations?:string[]): Promise<Bio | null> => {
    const bio = await repository.findOne({ 
        where:{
            id
        },
        relations
    } );
    return normalizeBio(bio);
}

export const getAllPublicBios = async (): Promise<{ sufix: string, updatedAt: Date }[]> => {
    return await repository.find({
        select: ['sufix', 'updatedAt'],
        where: [
            { noIndex: false },
            { noIndex: undefined } // In case it's null/undefined in DB
        ],
        order: { updatedAt: 'DESC' }
    });
}

export const getRandomPublicBios = async (limit: number): Promise<Array<{ sufix: string; fullName: string; description: string | null; profileImage: string | null }>> => {
    const safeLimit = Math.max(1, Math.min(limit, 20));

    const bios = await repository.createQueryBuilder("bio")
        .leftJoin("bio.user", "user")
        .select([
            "bio.sufix",
            "bio.description",
            "bio.profileImage",
            "bio.userId",
            "user.fullName"
        ])
        .where("bio.noIndex = false OR bio.noIndex IS NULL")
        .orderBy("RANDOM()")
        .take(safeLimit)
        .getRawMany();

    return bios.map((row) => {
        const profileImage = row.bio_profileImage || (row.bio_userId ? `${env.BACKEND_URL}/api/images/${row.bio_userId}/medium.png` : null);
        return {
            sufix: row.bio_sufix,
            fullName: row.user_fullName,
            description: row.bio_description || null,
            profileImage
        };
    });
};

export const updateBioById = async (id: string, options: UpdateBioOptions): Promise<Bio | null> => {
    const bio = await findBioById(id, ['integrations', 'user']) as BioEntity;
    if (!bio) return null;

    const { html, blocks, bgSettings, seoSettings, customDomain, layoutSettings, enableSubscribeButton, removeBranding, profileImage } = options;

    // Check Plan Limits using Active Plan
    const activePlan = await BillingService.getActivePlan(bio.user.id);
    const limits = PLAN_LIMITS[activePlan as PlanType];

    if (customDomain && !limits.customDomain) {
        throw new ApiError(APIErrors.forbiddenError, `Custom Domains are available on Standard and Pro plans.`, 403);
    }

    if (removeBranding && !limits.removeBranding) {
        throw new ApiError(APIErrors.forbiddenError, `Removing branding is available on Standard and Pro plans.`, 403);
    }

    if (seoSettings && !limits.seoSettings) {
        // Check if any SEO setting is actually being set
        const hasSeoUpdate = Object.values(seoSettings).some(v => v !== undefined && v !== null);
        if (hasSeoUpdate) {
            throw new ApiError(APIErrors.forbiddenError, `SEO capabilities are available on Standard and Pro plans.`, 403);
        }
    }
    
    if (enableSubscribeButton && !limits.emailCollection) {
        throw new ApiError(APIErrors.forbiddenError, `Email Collection is available on Standard and Pro plans.`, 403);
    }

    // Core fields
    if (html !== undefined) bio.html = html;
    if (blocks !== undefined) bio.blocks = blocks;
    // Convert empty string to null for unique constraint
    if (customDomain !== undefined) bio.customDomain = customDomain === "" ? null : customDomain;
    if (enableSubscribeButton !== undefined) bio.enableSubscribeButton = enableSubscribeButton;
    if (removeBranding !== undefined) bio.removeBranding = removeBranding;
    if (profileImage !== undefined) bio.profileImage = profileImage;
    if (options.font !== undefined) bio.font = options.font;
    if (options.customFontUrl !== undefined) bio.customFontUrl = options.customFontUrl;
    if (options.customFontName !== undefined) bio.customFontName = options.customFontName;

    // Background settings
    if (bgSettings) {
        applySettings(bio, bgSettings, [
            'bgType', 'bgColor', 'bgSecondaryColor', 'bgImage', 'bgVideo',
            'usernameColor', 'imageStyle', 'description', 'socials', 'displayProfileImage'
        ]);
    }

    // Layout settings
    if (layoutSettings) {
        applySettings(bio, layoutSettings, [
            'cardStyle', 'cardBackgroundColor', 'cardBorderColor', 'cardBorderWidth',
            'cardBorderRadius', 'cardShadow', 'cardPadding', 'maxWidth'
        ]);
    }

    // SEO settings
    if (seoSettings) {
        applySettings(bio, seoSettings, [
            'seoTitle', 'seoDescription', 'favicon', 'googleAnalyticsId', 'facebookPixelId',
            'seoKeywords', 'ogTitle', 'ogDescription', 'ogImage', 'noIndex'
        ]);
    }

    await repository.save(bio);

    // Refresh Cache
    try {
        // 1. Invalidate old keys
        await invalidateBioCache(bio as BioEntity);
        
        // 2. Refresh/Pre-warm: Generate public version for sufix
        // (This simulates a visit to the public page to store the "compiled" version)
        await getPublicBio(bio.sufix, 'sufix');

        if (bio.customDomain) {
            await getPublicBio(bio.customDomain, 'domain');
        }
    } catch (err) {
        console.error("Redis Cache Refresh Error:", err);
    }

    return normalizeBio(bio);
};

/**
 * Helper to apply partial settings to entity
 */
const applySettings = <T extends object>(target: any, source: T, keys: (keyof T)[]): void => {
    for (const key of keys) {
        if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
};

export const getBiosFromUser = async(userId:string, relations?: string[]):Promise<Bio[]|null> =>{
    return await repository.find({
        where:{userId},
        relations
    }) as Bio[] || null
}

export const createNewBio = async (sufix: string, userEmail: string): Promise<Partial<Bio> | ApiError> => {
    if (await findBioBySufix(sufix)) throw new ApiError(APIErrors.conflictError, "Username already in use!", 409)
    const user = await findUserByEmail(userEmail)
    if (!user) throw new ApiError(APIErrors.notFoundError, "User not found !", 404)
    
    // Check Plan Limits
    const activePlan = await BillingService.getActivePlan(user.id);
    const limits = PLAN_LIMITS[activePlan as PlanType];
    const currentBios = await getBiosFromUser(user.id);
    
    if (currentBios && currentBios.length >= limits.bios) {
        throw new ApiError(
            APIErrors.forbiddenError, 
            `Plan limit reached. You can only create ${limits.bios} bio(s) on the ${activePlan} plan.`, 
            403
        );
    }

    let newBio = await repository.create({ sufix })
    newBio.user = user as UserEntity;
    await repository.save(newBio)
    const payload = {
        id: newBio.id,
        sufix: newBio.sufix,
        clicks: newBio.clicks,
        views: newBio.views,
        html: newBio.html,
        createdAt: newBio.createdAt,
        user: newBio.userId
    }
    return payload;
}

/**
 * Retrieves a bio for public display, filtering out content
 * that the user's current plan does not support.
 */
export const getPublicBio = async (identifier: string, type: 'sufix' | 'domain'): Promise<Bio | null> => {
    // 1. Try Cache
    try {
        const cacheKey = getBioCacheKey(identifier, type);
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        console.error("Redis Cache Error (Get):", err);
    }

    let bio: Bio | null = null;
    
    if (type === 'domain') {
        bio = await findBioByCustomDomain(identifier);
    } else {
        bio = await findBioBySufixWithUser(identifier);
    }

    if (!bio) return null;

    // Get Active Plan (dynamically checked)
    // helper finds include 'user' relation
    const userObj = bio.user as any; 
    const userId = userObj?.id || userObj; 
    if(!userId || typeof userId !== 'string') return bio; 

    const activePlan = await BillingService.getActivePlan(userId);
    const isPro = activePlan === 'pro';
    const isStandard = activePlan === 'standard' || isPro;

    // Filter Content based on Plan
    if (!isStandard) {
        // Free Plan Limitations
        bio.removeBranding = false;
        bio.enableSubscribeButton = false;
        // Reset Custom Domain if accessed via custom domain? 
        // If accessed via custom domain but user is free, strictly speaking we should probably 404 or redirect, 
        // but the router handles the lookup. If we return null here, it will 404.
        if (type === 'domain') return null; 
    }

    if (Array.isArray(bio.blocks)) {
        bio.blocks = bio.blocks.filter((block: any) => {
    // Filter Pro-only blocks
            if (block.type === 'tour' && !isPro) return false;
            if (block.type === 'calendar' && !isPro) return false;
            
            // Filter other potential pro blocks if defined in future
            // e.g. if we add more pro blocks, add them here
            
            return true;
        });
    }

    // Ensure frontend gets the correct active plan
    if (bio.user && typeof bio.user !== 'string') {
        (bio.user as any).plan = activePlan;
    }

    // Cache the verified result
    await cacheBioData(identifier, type, bio);

    return bio;
}

// ==================== Cache Helpers ====================

const BIO_CACHE_TTL = 3600; // 1 hour in seconds

function getBioCacheKey(identifier: string, type: 'sufix' | 'domain'): string {
    return `bio:public:${type}:${identifier}`;
}

async function cacheBioData(identifier: string, type: 'sufix' | 'domain', data: any): Promise<void> {
    try {
        const key = getBioCacheKey(identifier, type);
        await redisClient.set(key, JSON.stringify(data), 'EX', BIO_CACHE_TTL);
    } catch (err) {
        console.error("Redis Cache Error (Set):", err);
    }
}

async function invalidateBioCache(bio: BioEntity): Promise<void> {
    try {
        const keys = [
            getBioCacheKey(bio.sufix, 'sufix')
        ];
        if (bio.customDomain) {
            keys.push(getBioCacheKey(bio.customDomain, 'domain'));
        }
        await redisClient.del(...keys);
    } catch (err) {
        console.error("Redis Cache Error (Del):", err);
    }
}
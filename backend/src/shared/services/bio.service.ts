import { AppDataSource } from "../../database/datasource"
import { BioEntity } from "../../database/entity/bio-entity"
import { UserEntity } from "../../database/entity/user-entity"
import { ApiError, APIErrors } from "../errors/api-error"
import { Bio } from "../types/bio.type"
import { findUserByEmail, findUserById } from "./user.service"
import { PLAN_LIMITS, PlanType } from "../constants/plan-limits"
import { BillingService } from "../../services/billing.service"

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
}

// ==================== Query Functions ====================

export const findBioBySufixWithUser = async (sufix: string): Promise<Bio | null> => { 
        return await repository.findOne({ 
            where:{
                sufix
            },
            relations:['user']
        }) as Bio || null
}

export const findBioByCustomDomain = async (customDomain: string): Promise<Bio | null> => { 
    return await repository.findOne({ 
        where:{
            customDomain
        },
        relations:['user']
    }) as Bio || null
}

export const findBioBySufix = async (sufix: string): Promise<Bio | null> => {
    return await repository.findOneBy({ sufix }) as Bio || null
}
export const findBioById= async (id: string,relations?:string[]): Promise<Bio | null> => {
    return await repository.findOne({ 
        where:{
            id
        },
        relations
    } ) as Bio || null
}
export const updateBioById = async (id: string, options: UpdateBioOptions): Promise<Bio | null> => {
    const bio = await findBioById(id, ['integrations', 'user']) as BioEntity;
    if (!bio) return null;

    const { html, blocks, bgSettings, seoSettings, customDomain, layoutSettings, enableSubscribeButton, removeBranding } = options;

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
    return bio as Bio;
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
            
            // Filter other potential pro blocks if defined in future
            // e.g. if we add more pro blocks, add them here
            
            return true;
        });
    }

    return bio;
}
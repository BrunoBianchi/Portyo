import { AppDataSource } from "../../database/datasource"
import { BioEntity } from "../../database/entity/bio-entity"
import { UserEntity } from "../../database/entity/user-entity"
import { ApiError, APIErrors } from "../errors/api-error"
import { Bio } from "../types/bio.type"
import { findUserByEmail } from "./user.service"

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
    const bio = await findBioById(id, ['integrations']) as BioEntity;
    if (!bio) return null;

    const { html, blocks, bgSettings, seoSettings, customDomain, layoutSettings, enableSubscribeButton } = options;

    // Core fields
    if (html !== undefined) bio.html = html;
    if (blocks !== undefined) bio.blocks = blocks;
    if (customDomain !== undefined) bio.customDomain = customDomain;
    if (enableSubscribeButton !== undefined) bio.enableSubscribeButton = enableSubscribeButton;

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
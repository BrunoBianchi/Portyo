import { AppDataSource } from "../../database/datasource"
import { BioEntity } from "../../database/entity/bio-entity"
import { UserEntity } from "../../database/entity/user-entity"
import { ApiError, APIErrors } from "../errors/api-error"
import { Bio } from "../types/bio.type"
const repository = AppDataSource.getRepository(BioEntity)
import { findUserByEmail } from "./user.service"

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
export const updateBioById = async(id:string, html?:string, blocks?: any[], bgSettings?: { bgType?: string, bgColor?: string, bgSecondaryColor?: string, bgImage?: string, bgVideo?: string, usernameColor?: string, imageStyle?: string }, seoSettings?: { seoTitle?: string, seoDescription?: string, favicon?: string, googleAnalyticsId?: string, facebookPixelId?: string, seoKeywords?: string, ogTitle?: string, ogDescription?: string, ogImage?: string, noIndex?: boolean }, customDomain?: string, layoutSettings?: { cardStyle?: string, cardBackgroundColor?: string, cardBorderColor?: string, cardBorderWidth?: number, cardBorderRadius?: number, cardShadow?: string, cardPadding?: number, maxWidth?: number }, enableSubscribeButton?: boolean): Promise<Bio | null> => { 
    let bio = await findBioById(id, ['integrations']) as BioEntity
    if (html !== undefined) bio.html = html;
    if (blocks !== undefined) bio.blocks = blocks;
    if (customDomain !== undefined) bio.customDomain = customDomain;
    if (enableSubscribeButton !== undefined) bio.enableSubscribeButton = enableSubscribeButton;
    
    if (bgSettings) {
        if (bgSettings.bgType) bio.bgType = bgSettings.bgType;
        if (bgSettings.bgColor) bio.bgColor = bgSettings.bgColor;
        if (bgSettings.bgSecondaryColor) bio.bgSecondaryColor = bgSettings.bgSecondaryColor;
        if (bgSettings.bgImage !== undefined) bio.bgImage = bgSettings.bgImage;
        if (bgSettings.bgVideo !== undefined) bio.bgVideo = bgSettings.bgVideo;
        if (bgSettings.usernameColor) bio.usernameColor = bgSettings.usernameColor;
        if (bgSettings.imageStyle) bio.imageStyle = bgSettings.imageStyle;
    }

    if (layoutSettings) {
        if (layoutSettings.cardStyle) bio.cardStyle = layoutSettings.cardStyle;
        if (layoutSettings.cardBackgroundColor) bio.cardBackgroundColor = layoutSettings.cardBackgroundColor;
        if (layoutSettings.cardBorderColor) bio.cardBorderColor = layoutSettings.cardBorderColor;
        if (layoutSettings.cardBorderWidth !== undefined) bio.cardBorderWidth = layoutSettings.cardBorderWidth;
        if (layoutSettings.cardBorderRadius !== undefined) bio.cardBorderRadius = layoutSettings.cardBorderRadius;
        if (layoutSettings.cardShadow) bio.cardShadow = layoutSettings.cardShadow;
        if (layoutSettings.cardPadding !== undefined) bio.cardPadding = layoutSettings.cardPadding;
        if (layoutSettings.maxWidth !== undefined) bio.maxWidth = layoutSettings.maxWidth;
    }

    if (seoSettings) {
        if (seoSettings.seoTitle !== undefined) bio.seoTitle = seoSettings.seoTitle;
        if (seoSettings.seoDescription !== undefined) bio.seoDescription = seoSettings.seoDescription;
        if (seoSettings.favicon !== undefined) bio.favicon = seoSettings.favicon;
        if (seoSettings.googleAnalyticsId !== undefined) bio.googleAnalyticsId = seoSettings.googleAnalyticsId;
        if (seoSettings.facebookPixelId !== undefined) bio.facebookPixelId = seoSettings.facebookPixelId;
        if (seoSettings.seoKeywords !== undefined) bio.seoKeywords = seoSettings.seoKeywords;
        if (seoSettings.ogTitle !== undefined) bio.ogTitle = seoSettings.ogTitle;
        if (seoSettings.ogDescription !== undefined) bio.ogDescription = seoSettings.ogDescription;
        if (seoSettings.ogImage !== undefined) bio.ogImage = seoSettings.ogImage;
        if (seoSettings.noIndex !== undefined) bio.noIndex = seoSettings.noIndex;
    }

    await repository.save(bio)
    return bio as Bio;
}

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
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
        }) || null
}

export const findBioBySufix = async (sufix: string): Promise<Bio | null> => {
    return await repository.findOneBy({ sufix }) || null
}
export const findBioById= async (id: string): Promise<Bio | null> => {
    return await repository.findOneBy({ id }) || null
}
export const updateBioById = async(id:string, html:string, blocks: any[], bgSettings?: { bgType?: string, bgColor?: string, bgSecondaryColor?: string, bgImage?: string, bgVideo?: string, usernameColor?: string, imageStyle?: string }): Promise<Bio | null> => { 
    let bio = await findBioById(id) as BioEntity
    bio.html = html ?? "";
    bio.blocks = blocks ?? [];
    
    if (bgSettings) {
        if (bgSettings.bgType) bio.bgType = bgSettings.bgType;
        if (bgSettings.bgColor) bio.bgColor = bgSettings.bgColor;
        if (bgSettings.bgSecondaryColor) bio.bgSecondaryColor = bgSettings.bgSecondaryColor;
        if (bgSettings.bgImage !== undefined) bio.bgImage = bgSettings.bgImage;
        if (bgSettings.bgVideo !== undefined) bio.bgVideo = bgSettings.bgVideo;
        if (bgSettings.usernameColor) bio.usernameColor = bgSettings.usernameColor;
        if (bgSettings.imageStyle) bio.imageStyle = bgSettings.imageStyle;
    }

    await repository.save(bio)
    return bio;
}

export const getBiosFromUser = async(userId:string):Promise<Bio[]|null> =>{
    return await repository.find({
        where:{userId}
    }) || null
}

export const createNewBio = async (sufix: string, userEmail: string): Promise<Partial<Bio> | ApiError> => {
    if (await findBioBySufix(sufix)) throw new ApiError(APIErrors.conflictError, "Sufix alread in use !", 409)
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
import { AppDataSource } from "../../database/datasource"
import { BioEntity } from "../../database/entity/bio-entity"
import { UserEntity } from "../../database/entity/user-entity"
import { ApiError, APIErrors } from "../errors/api-error"
import { Bio } from "../types/bio.type"
const repository = AppDataSource.getRepository(BioEntity)
import { findUserByEmail } from "./user.service"
export const findBioBySufix = async (sufix: string): Promise<Bio | null> => {
    return await repository.findOneBy({ sufix }) || null
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
import { QRCodeEntity } from "../../database/entity/qrcode-entity"
import { AppDataSource } from "../../database/datasource"
import { findBioById } from "./bio.service"
import { BioEntity } from "../../database/entity/bio-entity"
const repository = AppDataSource.getRepository(QRCodeEntity)
export const createQrCode = async(bioId:string,value:string) =>{
    const newqr = repository.create({value})
    newqr.bio = await findBioById(bioId) as BioEntity;
    await repository.save(newqr)
    return newqr;
}

export const getQrCodeById = async(id:string) => {
    return await repository.findOneBy({id})
}

export const getAllQrCodes = async(bioId:string) => {
    return await repository.find({
        where:{
            bio:{
                id:bioId
            }
        }
    })
}


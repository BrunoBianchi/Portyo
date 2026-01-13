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

export const countQrCodes = async(bioId:string) => {
    return await repository.count({
        where:{
            bio:{
                id:bioId
            }
        }
    })
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

export const trackQrCodeView = async(id: string, country?: string, device?: string) => {
    const qrCode = await repository.findOneBy({id});
    if (!qrCode) return null;
    
    qrCode.views += 1;
    qrCode.lastScannedAt = new Date();
    if (country) qrCode.country = country;
    if (device) qrCode.device = device;
    
    await repository.save(qrCode);
    return qrCode;
}

export const getQrCodeByIdPublic = async(id: string) => {
    return await repository.findOne({
        where: { id },
        relations: ['bio'],
        select: {
            id: true,
            value: true,
            views: true,
            clicks: true,
            bio: {
                id: true
            }
        }
    });
}


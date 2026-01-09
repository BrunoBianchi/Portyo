import { AppDataSource } from "../../database/datasource"
import { BioEntity } from "../../database/entity/bio-entity"
import { EmailEntity } from "../../database/entity/email-entity"
import { ApiError, APIErrors } from "../errors/api-error"
import { findBioById } from "./bio.service"
const repository = AppDataSource.getRepository(EmailEntity)
export const getEmailByEmailFromBio = async(email:string,bio:string) => {
    return await repository.findOne({
        where: {
            email,
            bios: {
                id: bio
            }
        } as any,
        relations: ['bios']
    })
}

export const addEmail = async(email:string,bio:string) => {
    const emailAlreadyInBio = await getEmailByEmailFromBio(email,bio);
    if(emailAlreadyInBio) throw new ApiError(APIErrors.EMAIL_ALREADY_EXISTS, "Email already exists in this bio", 409);
    else {
        const bioRepository = AppDataSource.getRepository(BioEntity);
        const bioObject = await bioRepository.findOne({ where: { id: bio }, relations: ['emails'] });
        
        if (!bioObject) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);

        let emailEntity = await repository.findOne({ where: { email } });
        
        if (!emailEntity) {
            emailEntity = repository.create({ email });
            await repository.save(emailEntity);
        }
        
        if (!bioObject.emails) bioObject.emails = [];
        bioObject.emails.push(emailEntity);
        
        await bioRepository.save(bioObject);
        return emailEntity;
    }
}

export const removeEmail = async(email:string,bio:string) => {
    const emailEntity = await getEmailByEmailFromBio(email,bio);
    if(!emailEntity) throw new ApiError(APIErrors.notFoundError, "Email does not exists in Bio", 404);
    else {
        emailEntity.bios = emailEntity.bios.filter(b => b.id !== bio);
        return await repository.save(emailEntity);
    }
}

export const getEmailsFromBio = async(bioId:string) => {
    return await repository.find({
        where: {
            bios: {
                id: bioId
            }
        } as any
    })
}

export const removeEmails = async(emails:string[],bio:string) => {
    const bioEntity = await findBioById(bio);
    if (!bioEntity) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);

    const emailEntities = await repository.createQueryBuilder("email")
        .leftJoinAndSelect("email.bios", "bio")
        .where("bio.id = :bioId", { bioId: bio })
        .andWhere("email.email IN (:...emails)", { emails })
        .getMany();

    if (emailEntities.length === 0) return;

    for (const email of emailEntities) {
        email.bios = email.bios.filter(b => b.id !== bio);
        await repository.save(email);
    }
}
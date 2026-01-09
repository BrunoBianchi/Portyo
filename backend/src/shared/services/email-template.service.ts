import { AppDataSource } from "../../database/datasource";
import { EmailTemplateEntity } from "../../database/entity/email-template-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import { isUserPro } from "./user-pro.service";

const repository = AppDataSource.getRepository(EmailTemplateEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

export const createTemplate = async (bioId: string, data: { name: string, content: any, html: string }) => {
    const bio = await bioRepository.findOne({ 
        where: { id: bioId }, 
        relations: ['user', 'emailTemplates'] 
    });

    if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);

    const isPro = await isUserPro(bio.user.id);
    if (!isPro) {
        throw new ApiError(APIErrors.paymentRequiredError, "Email Templates are a PRO feature", 402);
    }

    if (bio.emailTemplates && bio.emailTemplates.length >= 5) {
        throw new ApiError(APIErrors.badRequestError, "You have reached the maximum limit of 5 email templates", 400);
    }

    const template = repository.create({
        ...data,
        bio
    });

    return await repository.save(template);
};

export const getTemplates = async (bioId: string) => {
    return await repository.find({
        where: { bio: { id: bioId } },
        order: { createdAt: "DESC" }
    });
};

export const getTemplate = async (id: string, bioId: string) => {
    const template = await repository.findOne({
        where: { id, bio: { id: bioId } }
    });

    if (!template) throw new ApiError(APIErrors.notFoundError, "Template not found", 404);
    return template;
};

export const updateTemplate = async (id: string, bioId: string, data: { name?: string, content?: any, html?: string }) => {
    const template = await getTemplate(id, bioId);
    
    Object.assign(template, data);
    
    return await repository.save(template);
};

export const deleteTemplate = async (id: string, bioId: string) => {
    const template = await getTemplate(id, bioId);
    return await repository.remove(template);
};

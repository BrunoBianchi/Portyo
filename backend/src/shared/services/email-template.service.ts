import { AppDataSource } from "../../database/datasource";
import { EmailTemplateEntity } from "../../database/entity/email-template-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import { PLAN_LIMITS, PlanType } from "../constants/plan-limits";
import { BillingService } from "../../services/billing.service";

const repository = AppDataSource.getRepository(EmailTemplateEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

export const createTemplate = async (bioId: string, data: { name: string, content: any, html: string }) => {
    const bio = await bioRepository.findOne({ 
        where: { id: bioId }, 
        relations: ['user', 'emailTemplates'] 
    });

    if (!bio) throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);

    const activePlan = await BillingService.getActivePlan(bio.user.id);
    const limit = PLAN_LIMITS[activePlan as PlanType].emailTemplatesPerBio;

    const count = await repository.count({ where: { bio: { id: bioId } } });

    if (count >= limit) {
         throw new ApiError(APIErrors.forbiddenError, `You have reached the limit of ${limit} email template(s) for your ${activePlan} plan. Upgrade to create more.`, 403);
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

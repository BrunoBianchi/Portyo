import { AppDataSource } from "../database/datasource";
import { BioEntity } from "../database/entity/bio-entity";
import { FormAnswerEntity } from "../database/entity/form-answer-entity";
import { FormEntity } from "../database/entity/form-entity";
import { triggerAutomation } from "../shared/services/automation.service";
import { PLAN_LIMITS } from "../shared/constants/plan-limits";

export const formRepository = AppDataSource.getRepository(FormEntity);
export const formAnswerRepository = AppDataSource.getRepository(FormAnswerEntity);
export const bioRepository = AppDataSource.getRepository(BioEntity);

const checkPlanLimits = async (bioId: string, userId: string) => {
    // This function should check the user's plan and the number of forms they have.
    // Limits:
    // Free: 1, Standard: 3, Pro: 4
    
    // In a real scenario, we'd fetch the user's plan from the UserEntity
    // For this implementation, we'll assume the Plan Limit is passed or we fetch the user relation
    
    const bio = await bioRepository.findOne({ 
        where: { id: bioId }, 
        relations: ["user", "forms", "user.billings"] 
    });

    if (!bio) throw new Error("Bio not found");

    // Determine active plan from billings
    let plan = 'free';
    const now = new Date();
    
    // Sort billings by endDate desc to get the latest one
    if (bio.user?.billings && bio.user.billings.length > 0) {
        const activeBilling = bio.user.billings
            .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
            .find(b => new Date(b.endDate) > now); // Check if endDate is in the future

        if (activeBilling) {
            plan = activeBilling.plan;
        }
    }

    const formCount = bio.forms.length;
    // @ts-ignore
    const limit = PLAN_LIMITS[plan]?.formsPerBio || 0;

    if (formCount >= limit) {
        throw new Error(`Plan limit reached. You can only create ${limit} forms on the ${plan} plan.`);
    }
};

export const formService = {
    async create(bioId: string, userId: string, data: Partial<FormEntity>) {
        await checkPlanLimits(bioId, userId);

        const form = formRepository.create({
            ...data,
            bioId
        });
        return await formRepository.save(form);
    },

    async findAll(bioId: string) {
        return await formRepository.find({
            where: { bioId },
            order: { createdAt: "DESC" }
        });
    },

    async findOne(id: string) {
        return await formRepository.findOne({
            where: { id },
            relations: ["answers"]
        });
    },

    async update(id: string, data: Partial<FormEntity>) {
        await formRepository.update(id, data);
        return await formRepository.findOneBy({ id });
    },

    async delete(id: string) {
        return await formRepository.delete(id);
    },

    async submitAnswer(formId: string, data: any, metadata: { ip?: string, userAgent?: string }) {
        const form = await formRepository.findOneBy({ id: formId });
        if (!form) throw new Error("Form not found");
        if (!form.isActive) throw new Error("Form is inactive");

        const answer = formAnswerRepository.create({
            formId,
            answers: data,
            ipAddress: metadata.ip,
            userAgent: metadata.userAgent
        });

        await formAnswerRepository.save(answer);

        // Increment submission count
        form.submissions += 1;
        await formRepository.save(form);

        const totalSubmissionsRaw = await formRepository
            .createQueryBuilder("form")
            .select("SUM(form.submissions)", "total")
            .where("form.bioId = :bioId", { bioId: form.bioId })
            .getRawOne();

        const totalSubmissions = parseInt(totalSubmissionsRaw?.total || "0", 10) || 0;

        // Parse answers to find email and map variables
        let subscriberEmail = null;
        const variables: Record<string, any> = {};

        if (form.fields && Array.isArray(form.fields)) {
            form.fields.forEach((field: any) => {
                const value = data[field.id];
                if (value) {
                    // Normalize label to be variable-friendly (e.g. "First Name" -> "First_Name")
                    const safeLabel = field.label.replace(/[^a-zA-Z0-9]/g, '_');
                    variables[safeLabel] = value;
                    variables[field.id] = value;

                    // Smart email detection
                    if ((field.type === 'email' || field.label.toLowerCase().includes('email')) && typeof value === 'string' && value.includes('@')) {
                        subscriberEmail = value;
                    }
                }
            });
        }

        // Trigger Automation
        // We do this asynchronously so it doesn't block the response
        triggerAutomation(form.bioId, 'form_submit', {
            formId: form.id,
            formTitle: form.title,
            email: subscriberEmail,
            ...variables
        }).catch(err => console.error("Failed to trigger automation", err));

        triggerAutomation(form.bioId, 'form_submit_milestone', {
            milestoneCount: totalSubmissions,
            bioName: form.bio?.sufix || undefined
        }).catch(err => console.error("Failed to trigger form milestone automation", err));

        return answer;
    },

    async getAnswers(formId: string) {
        return await formAnswerRepository.find({
            where: { formId },
            order: { createdAt: "DESC" }
        });
    }
};

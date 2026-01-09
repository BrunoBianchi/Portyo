import { AppDataSource } from "../database/datasource";
import { ActivityEntity, ActivityType } from "../database/entity/activity-entity";

export class ActivityService {
    private activityRepository = AppDataSource.getRepository(ActivityEntity);

    async logActivity(bioId: string, type: ActivityType, description: string, metadata?: any) {
        const activity = this.activityRepository.create({
            bioId,
            type,
            description,
            metadata
        });
        return await this.activityRepository.save(activity);
    }

    async getRecentActivities(bioId: string, page: number = 1, limit: number = 5, type?: string) {
        const skip = (page - 1) * limit;
        const whereClause: any = { bioId };
        if (type && type !== 'ALL') {
            whereClause.type = type;
        }

        const [activities, total] = await this.activityRepository.findAndCount({
            where: whereClause,
            order: { createdAt: "DESC" },
            take: limit,
            skip: skip
        });
        
        return {
            data: activities,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}

export const activityService = new ActivityService();

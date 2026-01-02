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

    async getRecentActivities(bioId: string, limit: number = 5) {
        return await this.activityRepository.find({
            where: { bioId },
            order: { createdAt: "DESC" },
            take: limit
        });
    }
}

export const activityService = new ActivityService();

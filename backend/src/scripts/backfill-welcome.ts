
import { AppDataSource } from "../database/datasource";
import { UserEntity } from "../database/entity/user-entity";
import { NotificationEntity, NotificationType } from "../database/entity/notification-entity";
import { notificationService } from "../services/notification.service";

const backfillWelcomeNotifications = async () => {
    try {
        console.log("Connecting to database...");
        await AppDataSource.initialize();
        console.log("Database connected.");

        const userRepo = AppDataSource.getRepository(UserEntity);
        const notificationRepo = AppDataSource.getRepository(NotificationEntity);

        console.log("Fetching users...");
        const users = await userRepo.find({ select: ["id", "fullName", "email"] });
        console.log(`Found ${users.length} users.`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            // Check if user already has a welcome notification (approximate check by title or type/metadata)
            // Or just check if they have ANY notification of type ANNOUNCEMENT with title "Welcome..."
            const existing = await notificationRepo.findOne({
                where: {
                    userId: user.id,
                    type: NotificationType.ANNOUNCEMENT,
                    title: "Welcome to Portyo! 🎉"
                }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // Create notification
            await notificationService.createWelcomeNotification(user.id);
            createdCount++;
            
            if (createdCount % 10 === 0) {
                console.log(`Progress: ${createdCount} created...`);
            }
        }

        console.log("Backfill complete!");
        console.log(`Created: ${createdCount}`);
        console.log(`Skipped: ${skippedCount}`);

        process.exit(0);
    } catch (error) {
        console.error("Backfill failed:", error);
        process.exit(1);
    }
};

backfillWelcomeNotifications();

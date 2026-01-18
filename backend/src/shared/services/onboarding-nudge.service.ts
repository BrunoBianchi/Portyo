import { In } from "typeorm";
import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";
import { MailService } from "./mail.service";
import { logger } from "../utils/logger";

const HOURS_12_MS = 12 * 60 * 60 * 1000;

export async function sendOnboardingNudges(): Promise<void> {
    const userRepo = AppDataSource.getRepository(UserEntity);
    const cutoff = new Date(Date.now() - HOURS_12_MS);

    const userIdRows = await userRepo
        .createQueryBuilder("user")
        .leftJoin("user.bios", "bio")
        .select("user.id", "id")
        .where("user.createdAt <= :cutoff", { cutoff })
        .andWhere("user.onboardingNudgeSentAt IS NULL")
        .andWhere("user.verified = :verified", { verified: true })
        .groupBy("user.id")
        .having("COUNT(bio.id) = 0 OR MAX(bio.updatedAt) <= :cutoff", { cutoff })
        .getRawMany();
    console.log(userIdRows)
    const userIds = userIdRows.map((row) => row.id);
    if (userIds.length === 0) return;

    const users = await userRepo.findBy({ id: In(userIds) });
    if (users.length === 0) return;

    for (const user of users) {
        try {
            await MailService.sendOnboardingNudgeEmail(user.email, user.fullName);
            user.onboardingNudgeSentAt = new Date();
            await userRepo.save(user);
        } catch (error) {
            logger.error("Failed to send onboarding nudge", { userId: user.id, error });
        }
    }
}

import { AppDataSource } from "../database/datasource";
import { UserEntity } from "../database/entity/user-entity";
import { NewsletterLogEntity } from "../database/entity/newsletter-log-entity";
import { MailService } from "../shared/services/mail.service";
import { NEWSLETTER_TEMPLATES, type NewsletterTemplate } from "../shared/templates/newsletter-templates";
import { logger } from "../shared/utils/logger";
import { IsNull, LessThan, In, Not } from "typeorm";

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000; // 1 second delay between batches to respect rate limits
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines which templates are eligible for a user based on their plan
 */
function getEligibleTemplates(plan: string): NewsletterTemplate[] {
    const isPaid = plan === "standard" || plan === "pro";
    return NEWSLETTER_TEMPLATES.filter((t) => {
        if (t.targetPlans === "all") return true;
        if (t.targetPlans === "free" && !isPaid) return true;
        if (t.targetPlans === "paid" && isPaid) return true;
        return false;
    });
}

export class NewsletterService {

    /**
     * Main entry point called by cron job every 2 days.
     * Finds all eligible users and sends them the next newsletter template.
     */
    static async sendNewsletters(): Promise<void> {
        logger.info("📧 Starting newsletter batch send...");

        const userRepo = AppDataSource.getRepository(UserEntity);
        const logRepo = AppDataSource.getRepository(NewsletterLogEntity);

        try {
            // Find users eligible for newsletter:
            // - verified = true
            // - emailOptOut = false
            // - lastNewsletterSentAt is NULL or older than 2 days
            const twoDaysAgo = new Date(Date.now() - TWO_DAYS_MS);

            const eligibleUsers = await userRepo
                .createQueryBuilder("user")
                .where("user.verified = :verified", { verified: true })
                .andWhere("user.emailOptOut = :optOut", { optOut: false })
                .andWhere("user.isBanned = :banned", { banned: false })
                .andWhere(
                    "(user.lastNewsletterSentAt IS NULL OR user.lastNewsletterSentAt < :twoDaysAgo)",
                    { twoDaysAgo }
                )
                .select(["user.id", "user.fullName", "user.email", "user.plan"])
                .getMany();

            logger.info(`📧 Found ${eligibleUsers.length} users eligible for newsletter`);

            if (eligibleUsers.length === 0) return;

            // Process in batches
            for (let i = 0; i < eligibleUsers.length; i += BATCH_SIZE) {
                const batch = eligibleUsers.slice(i, i + BATCH_SIZE);
                
                await Promise.allSettled(
                    batch.map((user) => this.sendToUser(user, logRepo, userRepo))
                );

                // Delay between batches
                if (i + BATCH_SIZE < eligibleUsers.length) {
                    await sleep(BATCH_DELAY_MS);
                }
            }

            logger.info("✅ Newsletter batch send completed");
        } catch (error) {
            logger.error("❌ Newsletter batch send failed:", error as any);
        }
    }

    /**
     * Send the next unsent template to a single user.
     */
    private static async sendToUser(
        user: Pick<UserEntity, "id" | "fullName" | "email" | "plan">,
        logRepo: ReturnType<typeof AppDataSource.getRepository<NewsletterLogEntity>>,
        userRepo: ReturnType<typeof AppDataSource.getRepository<UserEntity>>
    ): Promise<void> {
        try {
            const eligible = getEligibleTemplates(user.plan);
            if (eligible.length === 0) return;

            // Get all template IDs already sent to this user
            const sentLogs = await logRepo.find({
                where: { userId: user.id, status: "sent" },
                select: ["templateId"],
            });
            const sentIds = new Set(sentLogs.map((l) => l.templateId));

            // Find the first unsent template in order
            let template = eligible.find((t) => !sentIds.has(t.id));

            // If all have been sent, cycle back to the first template
            if (!template) {
                template = eligible[0];
            }

            const vars = {
                fullName: user.fullName,
                email: user.email,
                userId: user.id,
                plan: user.plan,
            };

            const html = template.getHtml(vars);

            // Send the email
            await MailService.sendNewsletter(user.email, template.subject, html);

            // Log success
            const log = logRepo.create({
                userId: user.id,
                templateId: template.id,
                emailSubject: template.subject,
                status: "sent",
            });
            await logRepo.save(log);

            // Update user's lastNewsletterSentAt
            await userRepo.update(user.id, {
                lastNewsletterSentAt: new Date(),
            });

        } catch (error) {
            logger.error(`❌ Failed to send newsletter to ${user.email}:`, error as any);

            // Log failure
            try {
                const log = logRepo.create({
                    userId: user.id,
                    templateId: "unknown",
                    emailSubject: "Failed",
                    status: "failed",
                });
                await logRepo.save(log);
            } catch {
                // Silently ignore log failure
            }
        }
    }
}

import schedule from "node-schedule";
import { AppDataSource } from "../database/datasource";
import { UserEntity } from "../database/entity/user-entity";
import { BillingEntity } from "../database/entity/billing-entity";
import { notificationService } from "./notification.service";
import { MailService } from "../shared/services/mail.service";
import { IsNull, Between, LessThan, MoreThan } from "typeorm";
import { processAutoPostQueue, runAutoPostJob } from "./auto-post.service";
import { processSiteAutoPostQueue, runSiteAutoPostJob } from "./site-auto-post.service";
import { enqueueDueSocialPlannerPosts, processSocialPlannerQueue } from "./social-planner.service";
import { CustomDomainService } from "../shared/services/custom-domain.service";
import { NewsletterService } from "./newsletter.service";
import { logger } from "../shared/utils/logger";
import { IntegrationEntity } from "../database/entity/integration-entity";
import { instagramService } from "./instagram.service";

export class CronService {
    
    /**
     * Initialize all cron jobs
     */
    static init() {
        console.log("⏰ Initializing Cron Jobs...");
        
        // Run every day at 10:00 AM
        schedule.scheduleJob("0 10 * * *", () => {
            this.checkPlanExpiration();
        });
        
        // Run auto-post job every hour (enqueue)
        schedule.scheduleJob("0 */1 * * *", () => {
            runAutoPostJob();
        });

        // Process queued auto-posts every minute
        schedule.scheduleJob("* * * * *", () => {
            processAutoPostQueue();
        });

        // Run site auto-post job every hour (enqueue)
        schedule.scheduleJob("0 */1 * * *", () => {
            runSiteAutoPostJob();
        });

        // Verify due social planner posts every hour and enqueue in Redis
        schedule.scheduleJob("0 */1 * * *", () => {
            enqueueDueSocialPlannerPosts();
        });

        // Process queued social planner posts every minute
        schedule.scheduleJob("* * * * *", () => {
            processSocialPlannerQueue();
        });

        // Refresh Instagram long-lived tokens every 6 hours
        schedule.scheduleJob("0 */6 * * *", () => {
            this.refreshInstagramTokens();
        });

        // Process queued site auto-posts every minute
        schedule.scheduleJob("* * * * *", () => {
            processSiteAutoPostQueue();
        });

        // Check custom domains health every hour
        schedule.scheduleJob("0 */1 * * *", () => {
            this.checkCustomDomainsHealth();
        });

        // Enqueue pending custom domains DNS check every 30 minutes
        schedule.scheduleJob("*/30 * * * *", () => {
            this.enqueuePendingCustomDomainsDnsCheck();
        });

        // Process custom domains DNS queue every minute
        schedule.scheduleJob("* * * * *", () => {
            this.processCustomDomainsDnsQueue();
        });

        // Renew SSL certificates daily at 3 AM
        schedule.scheduleJob("0 3 * * *", () => {
            this.renewSSLCertificates();
        });

        // Send newsletters every 2 days at 11 AM
        schedule.scheduleJob("0 11 */2 * *", () => {
            this.sendNewsletters();
        });
        
        console.log("✅ Cron Jobs scheduled.");
    }

    /**
     * Check for plans expiring in 1 day or already expired
     */
    static async checkPlanExpiration() {
        console.log("🔄 Running Plan Expiration Check...");
        
        try {
            const userRepo = AppDataSource.getRepository(UserEntity);
            const billingRepo = AppDataSource.getRepository(BillingEntity);
            
            const today = new Date();
            
            // ---------------------------------------------------------
            // 1. Upcoming Expirations (In 1 day)
            // ---------------------------------------------------------
            const targetDateStart = new Date(today);
            targetDateStart.setDate(today.getDate() + 1);
            targetDateStart.setHours(0, 0, 0, 0);
            
            const targetDateEnd = new Date(targetDateStart);
            targetDateEnd.setHours(23, 59, 59, 999);
            
            const expiringSoonUsers = await userRepo.find({
                where: {
                    planExpiresAt: Between(targetDateStart, targetDateEnd),
                    plan: MoreThan("free")
                }
            });
            
            console.log(`Found ${expiringSoonUsers.length} users with plans expiring soon.`);
            
            for (const user of expiringSoonUsers) {
                const lastBilling = await billingRepo.findOne({
                    where: { userId: user.id },
                    order: { startDate: "DESC" }
                });
                const isTrial = lastBilling?.price === 0;

                // Send In-App Notification
                await notificationService.createPlanExpirationNotification(user.id, 1, isTrial);

                // Send Email (only if not sent effectively for this cycle)
                // Logic: Not sent yet, or sent before the current expiry date (meaning previous cycle or never)
                const alreadySentForThisCycle = user.planExpirationEmailSentAt && 
                                              user.planExpiresAt && 
                                              user.planExpirationEmailSentAt > new Date(user.planExpiresAt.getTime() - 30 * 24 * 60 * 60 * 1000);

                if (!alreadySentForThisCycle) {
                     await MailService.sendPlanExpirationEmail(user.email, user.fullName, 1, isTrial, false);
                     
                     user.planExpirationEmailSentAt = new Date();
                     await userRepo.save(user);
                     console.log(`Sent upcoming expiration email to ${user.email}`);
                }
            }
            
            // ---------------------------------------------------------
            // 2. Already Expired (Catch-up for those who missed it)
            // ---------------------------------------------------------
            const expiredUsers = await userRepo.find({
                where: {
                    planExpiresAt: LessThan(today),
                    plan: MoreThan("free"), // Still marked as paid/trial in DB
                    planExpirationEmailSentAt: IsNull() // Hasn't received the email yet
                }
            });
            
            console.log(`Found ${expiredUsers.length} expired users needing notification.`);

            for (const user of expiredUsers) {
                 const lastBilling = await billingRepo.findOne({
                    where: { userId: user.id },
                    order: { startDate: "DESC" }
                });
                const isTrial = lastBilling?.price === 0;
                
                await MailService.sendPlanExpirationEmail(user.email, user.fullName, 0, isTrial, true);
                
                user.planExpirationEmailSentAt = new Date();
                await userRepo.save(user);
                console.log(`Sent EXPIRED email to ${user.email}`);
            }

        } catch (error) {
            console.error("❌ Error in checkPlanExpiration:", error);
        }
    }

    /**
     * Check health of all custom domains
     */
    static async checkCustomDomainsHealth() {
        logger.info("🔄 Running Custom Domains Health Check...");
        
        try {
            await CustomDomainService.checkAllDomainsHealth();
            logger.info("✅ Custom domains health check completed");
        } catch (error) {
            logger.error("❌ Error in checkCustomDomainsHealth:", error);
        }
    }

    static async enqueuePendingCustomDomainsDnsCheck() {
        try {
            await CustomDomainService.enqueuePendingDomainsForDnsCheck();
        } catch (error) {
            logger.error("❌ Error enqueuing custom domains DNS checks:", error);
        }
    }

    static async processCustomDomainsDnsQueue() {
        try {
            await CustomDomainService.processDnsVerificationQueue();
        } catch (error) {
            logger.error("❌ Error processing custom domains DNS queue:", error);
        }
    }

    /**
     * Send newsletters to eligible users every 2 days
     */
    static async sendNewsletters() {
        logger.info("📧 Running Newsletter Send Job...");
        try {
            await NewsletterService.sendNewsletters();
            logger.info("✅ Newsletter send job completed");
        } catch (error) {
            logger.error("❌ Error in sendNewsletters:", error);
        }
    }

    /**
     * Renew SSL certificates nearing expiration
     */
    static async renewSSLCertificates() {
        logger.info("🔄 Running SSL Certificate Renewal...");
        
        try {
            await CustomDomainService.renewExpiringCertificates();
            logger.info("✅ SSL certificate renewal completed");
        } catch (error) {
            logger.error("❌ Error in renewSSLCertificates:", error);
        }
    }

    static async refreshInstagramTokens() {
        logger.info("🔄 Running Instagram token refresh job...");

        try {
            const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
            const now = new Date();
            const refreshBefore = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const dueIntegrations = await integrationRepository
                .createQueryBuilder("integration")
                .where("integration.provider = :provider", { provider: "instagram" })
                .andWhere("integration.accessToken IS NOT NULL")
                .andWhere("(integration.tokenRefreshLockUntil IS NULL OR integration.tokenRefreshLockUntil <= :now)", { now })
                .andWhere(
                    "(integration.accessTokenExpiresAt IS NULL OR integration.accessTokenExpiresAt <= :refreshBefore)",
                    { refreshBefore }
                )
                .orderBy("integration.accessTokenExpiresAt", "ASC", "NULLS FIRST")
                .take(100)
                .getMany();

            if (dueIntegrations.length === 0) {
                logger.info("✅ Instagram token refresh job finished: no due integrations");
                return;
            }

            let refreshedCount = 0;
            let failedCount = 0;

            for (const integration of dueIntegrations) {
                try {
                    const forceRefresh = !integration.accessTokenExpiresAt;
                    await instagramService.ensureFreshIntegrationAccessToken(
                        integration,
                        integrationRepository,
                        {
                            forceRefresh,
                            thresholdSeconds: 7 * 24 * 60 * 60,
                        }
                    );
                    refreshedCount += 1;
                } catch (error: any) {
                    failedCount += 1;
                    logger.warn(
                        `[InstagramTokenRefreshCron] Failed for integration ${integration.id}: ${error?.message || error}`
                    );
                }
            }

            logger.info(
                `✅ Instagram token refresh job finished. Refreshed: ${refreshedCount}, Failed: ${failedCount}`
            );
        } catch (error: any) {
            logger.error("❌ Error in refreshInstagramTokens:", error?.message || error);
        }
    }
}

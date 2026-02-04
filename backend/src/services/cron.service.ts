import schedule from "node-schedule";
import { AppDataSource } from "../database/datasource";
import { UserEntity } from "../database/entity/user-entity";
import { BillingEntity } from "../database/entity/billing-entity";
import { notificationService } from "./notification.service";
import { MailService } from "../shared/services/mail.service";
import { IsNull, Between, LessThan, MoreThan } from "typeorm";
import { processAutoPostQueue, runAutoPostJob } from "./auto-post.service";
import { processSiteAutoPostQueue, runSiteAutoPostJob } from "./site-auto-post.service";
import { CustomDomainService } from "../shared/services/custom-domain.service";
import { logger } from "../shared/utils/logger";

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

        // Process queued site auto-posts every minute
        schedule.scheduleJob("* * * * *", () => {
            processSiteAutoPostQueue();
        });

        // Check custom domains health every hour
        schedule.scheduleJob("0 */1 * * *", () => {
            this.checkCustomDomainsHealth();
        });

        // Renew SSL certificates daily at 3 AM
        schedule.scheduleJob("0 3 * * *", () => {
            this.renewSSLCertificates();
        });
        
        console.log("✅ Cron Jobs scheduled.");
    }

    /**
     * Check for plans expiring in 2 days or already expired
     */
    static async checkPlanExpiration() {
        console.log("🔄 Running Plan Expiration Check...");
        
        try {
            const userRepo = AppDataSource.getRepository(UserEntity);
            const billingRepo = AppDataSource.getRepository(BillingEntity);
            
            const today = new Date();
            
            // ---------------------------------------------------------
            // 1. Upcoming Expirations (In 2 days)
            // ---------------------------------------------------------
            const targetDateStart = new Date(today);
            targetDateStart.setDate(today.getDate() + 2);
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
                await notificationService.createPlanExpirationNotification(user.id, 2, isTrial);

                // Send Email (only if not sent effectively for this cycle)
                // Logic: Not sent yet, or sent before the current expiry date (meaning previous cycle or never)
                const alreadySentForThisCycle = user.planExpirationEmailSentAt && 
                                              user.planExpiresAt && 
                                              user.planExpirationEmailSentAt > new Date(user.planExpiresAt.getTime() - 30 * 24 * 60 * 60 * 1000);

                if (!alreadySentForThisCycle) {
                     await MailService.sendPlanExpirationEmail(user.email, user.fullName, 2, isTrial, false);
                     
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
}

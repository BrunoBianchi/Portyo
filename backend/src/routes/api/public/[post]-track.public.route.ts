import { Router, Request, Response } from "express";
import geoip from "geoip-lite";
import { AppDataSource } from "../../../database/datasource";
import { PageViewEntity } from "../../../database/entity/page-view-entity";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ActivityEntity, ActivityType } from "../../../database/entity/activity-entity";
import z from "zod";

const router: Router = Router();
const pageViewRepository = AppDataSource.getRepository(PageViewEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);
const activityRepository = AppDataSource.getRepository(ActivityEntity);

    const trackSchema = z.object({
    bioId: z.string().uuid(),
    referrer: z.string().optional(),
    sessionId: z.string().optional(),
    type: z.enum(["view", "click"]).optional().default("view")
});

import { BillingService } from "../../../services/billing.service";

// Public tracking route - no auth required
router.post("/track", async (req: Request, res: Response) => {
    try {
        const { bioId, referrer, sessionId, type } = trackSchema.parse(req.body);

        // Verify bio exists with user to check plan
        const bio = await bioRepository.findOne({ 
            where: { id: bioId },
            relations: ['user']
        });
        if (!bio) {
            return res.status(404).json({ error: "Bio not found" });
        }

        // Check if user is Pro - DISABLED, allow for all
        // Tracking only available for Pro users
        /*
        const activePlan = await BillingService.getActivePlan(bio.user.id);
        if (activePlan !== 'pro') {
            return res.status(200).json({ success: true, ignored: true });
        }
        */

        // Extract IP address
        let ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                   req.socket.remoteAddress ||
                   '';

        // Mock IP for localhost development to test geo-analytics
        if (ip === '::1' || ip === '127.0.0.1' || ip.includes('192.168.') || ip === '::ffff:127.0.0.1') {
            const mockIps = [
                '8.8.8.8',       // US
                '200.147.67.142', // BR
                '85.214.132.117', // DE
                '185.230.125.1'   // GB
            ];
            ip = mockIps[Math.floor(Math.random() * mockIps.length)];
            console.log("Mocking localhost IP to:", ip);
        }

        // Get geo data from IP
        const geo = geoip.lookup(ip);

        // Extract device/browser from User-Agent
        const userAgent = req.headers['user-agent'] || '';
        let device = 'Desktop';
        if (/mobile/i.test(userAgent)) {
            device = 'Mobile';
        } else if (/tablet/i.test(userAgent)) {
            device = 'Tablet';
        }

        // Extract browser name
        let browser = 'Unknown';
        if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
            browser = 'Chrome';
        } else if (/firefox/i.test(userAgent)) {
            browser = 'Firefox';
        } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
            browser = 'Safari';
        } else if (/edge/i.test(userAgent)) {
            browser = 'Edge';
        } else if (/opera|opr/i.test(userAgent)) {
            browser = 'Opera';
        }

        // Create page view record
        const pageView = pageViewRepository.create({
            bioId,
            type,
            country: geo?.country || undefined,
            city: geo?.city || undefined,
            region: geo?.region || undefined,
            latitude: geo?.ll?.[0] || undefined,
            longitude: geo?.ll?.[1] || undefined,
            device,
            browser,
            referrer: referrer || undefined,
            sessionId: sessionId || undefined
        });

        await pageViewRepository.save(pageView);

        // Create activity record for analytics
        const activityType = type === 'view' ? ActivityType.VIEW : ActivityType.CLICK;
        const activityDescription = type === 'view' 
            ? `Page view from ${geo?.country || 'Unknown'} (${device} - ${browser})`
            : `Link click from ${geo?.country || 'Unknown'} (${device} - ${browser})`;
        
        const activity = activityRepository.create({
            bioId,
            type: activityType,
            description: activityDescription,
            metadata: {
                country: geo?.country,
                city: geo?.city,
                device,
                browser,
                referrer,
                sessionId,
                ip: ip.substring(0, ip.lastIndexOf('.') + 1) + 'xxx' // Mask IP for privacy
            }
        });

        await activityRepository.save(activity);

        // Increment bio views/clicks counter
        if (type === 'view') {
            await bioRepository.increment({ id: bioId }, 'views', 1);
            
            const updatedBio = await bioRepository.findOne({ where: { id: bioId } });
            if (updatedBio) {
                const { triggerAutomation } = await import("../../../shared/services/automation.service");
                const payload = {
                    milestoneCount: updatedBio.views,
                    bioName: updatedBio.sufix
                };
                triggerAutomation(bioId, 'view_milestone', payload).catch(err => console.error("Failed to trigger view milestone automation", err));
                triggerAutomation(bioId, 'visit_milestone', payload).catch(err => console.error("Failed to trigger legacy visit milestone automation", err));
            }
        } else {
            await bioRepository.increment({ id: bioId }, 'clicks', 1);
            const updatedBio = await bioRepository.findOne({ where: { id: bioId } });
            if (updatedBio) {
                const { triggerAutomation } = await import("../../../shared/services/automation.service");
                triggerAutomation(bioId, 'click_milestone', {
                    milestoneCount: updatedBio.clicks,
                    bioName: updatedBio.sufix
                }).catch(err => console.error("Failed to trigger click milestone automation", err));
            }
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Invalid request data" });
        }
        console.error("Track error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

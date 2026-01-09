import { Router } from "express";
import { addEmail } from "../../../shared/services/email.service";
import { z } from "zod";
import { activityService } from "../../../services/activity.service";
import { ActivityType } from "../../../database/entity/activity-entity";
import { triggerAutomation } from "../../../shared/services/automation.service";
import { logger } from "../../../shared/utils/logger";

const router: Router = Router();

router.post("/subscribe/:id", async (req, res) => {
    try {
        const { id } = z.object({ id: z.string() }).parse(req.params);
        const { email } = z.object({ email: z.string().email() }).parse(req.body);

        const result = await addEmail(email, id);
        
        // Log activity
        await activityService.logActivity(id, ActivityType.SUBSCRIBE, `New subscriber: ${email}`, { email });

        // Trigger newsletter_subscribe automation
        try {
            logger.info(`Triggering newsletter_subscribe automation for bio ${id} with email ${email}`);
            const executions = await triggerAutomation(id, 'newsletter_subscribe', { email });
            logger.info(`Triggered ${executions.length} automation(s) for newsletter subscription`);
        } catch (automationError: any) {
            // Log but don't fail the subscription if automation fails
            logger.error(`Automation trigger failed: ${automationError.message}`);
        }

        res.status(201).json(result);
    } catch (error: any) {
        // If email already exists (409), we can treat it as success for the public user to avoid leaking info, 
        // or return the error. For now, let's return the error but maybe the frontend handles it gracefully.
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;


import { Router, Request, Response } from "express";
import { triggerAutomation } from "../../../shared/services/automation.service";
import { logger } from "../../../shared/utils/logger";
import z from "zod";

const router: Router = Router();

// Trigger automation events from public bio page
// POST /api/public/events/:bioId
router.post("/:bioId", async (req: Request, res: Response) => {
    try {
        const { bioId } = z.object({ bioId: z.string().uuid() }).parse(req.params);
        const { eventType, data } = z.object({
            eventType: z.enum([
                'bio_visit',
                'link_click',
                'product_purchase',
                'cart_abandoned',
                'form_submit',
                'milestone_reached',
                'custom_event'
            ]),
            data: z.record(z.string(), z.any()).optional()
        }).parse(req.body);

        logger.info(`[Events] Received ${eventType} event for bio ${bioId}`);

        // Trigger matching automations
        const executions = await triggerAutomation(bioId, eventType, data || {});

        logger.info(`[Events] Triggered ${executions.length} automation(s) for ${eventType}`);

        return res.status(200).json({
            success: true,
            eventType,
            automationsTriggered: executions.length
        });
    } catch (error: any) {
        logger.error(`[Events] Error: ${error.message}`);
        return res.status(400).json({ error: error.message });
    }
});

export default router;

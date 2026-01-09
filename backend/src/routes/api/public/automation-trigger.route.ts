import { Router } from "express";
import { z } from "zod";
import { triggerAutomation } from "../../../shared/services/automation.service";
import { logger } from "../../../shared/utils/logger";

const router: Router = Router();

// Public trigger endpoint for automations
// This can be called by:
// - Frontend when newsletter subscribe happens
// - Webhooks from external services
// - Page events
router.post("/trigger/:bioId", async (req, res) => {
    try {
        const { bioId } = z.object({ bioId: z.string().uuid() }).parse(req.params);
        const { event, data } = z.object({
            event: z.string(),
            data: z.any().optional(),
        }).parse(req.body);

        logger.info(`Automation trigger received: ${event} for bio ${bioId}`);

        const executions = await triggerAutomation(bioId, event, data || {});

        res.json({
            triggered: true,
            executionsStarted: executions.length,
            executions: executions.map(e => ({
                id: e.id,
                status: e.status,
                automationId: e.automationId,
            })),
        });
    } catch (error: any) {
        logger.error(`Automation trigger failed: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;

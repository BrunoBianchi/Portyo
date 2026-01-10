import { Router } from "express";
import { z } from "zod";
import {
    createAutomation,
    getAutomationsByBio,
    getAutomationById,
    updateAutomation,
    deleteAutomation,
    activateAutomation,
    deactivateAutomation,
    getExecutionsByAutomation,
} from "../../../shared/services/automation.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { isUserPro, requirePaidPlan } from "../../../middlewares/user-pro.middleware";
import { requireAutomationOwner } from "../../../middlewares/automation-owner.middleware";

const router: Router = Router();


// Create automation - Requires Paid Plan + Bio ownership
router.post("/:id", requireAuth, ownerMiddleware, requirePaidPlan, async (req, res) => {
    try {
        const { id: bioId } = z.object({ id: z.string().uuid() }).parse(req.params);
        const { name, nodes, edges } = z.object({
            name: z.string().min(1),
            nodes: z.array(z.any()),
            edges: z.array(z.any()),
        }).parse(req.body);

        const automation = await createAutomation(bioId, name, nodes, edges);
        res.status(201).json(automation);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// List automations for a bio - Requires Paid Plan + Bio ownership
router.get("/bio/:id", requireAuth, ownerMiddleware, requirePaidPlan, async (req, res) => {
    try {
        const { id: bioId } = z.object({ id: z.string().uuid() }).parse(req.params);
        const automations = await getAutomationsByBio(bioId);
        res.json(automations);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Get single automation - Requires Paid Plan + Automation ownership
router.get("/:automationId", requireAuth, requirePaidPlan, requireAutomationOwner, async (req, res) => {
    try {
        const { automationId } = z.object({ automationId: z.string().uuid() }).parse(req.params);
        const automation = await getAutomationById(automationId);
        if (!automation) {
            return res.status(404).json({ message: "Automation not found" });
        }
        res.json(automation);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Update automation - Requires Paid Plan + Automation ownership
router.put("/:automationId", requireAuth, requirePaidPlan, requireAutomationOwner, async (req, res) => {
    try {
        const { automationId } = z.object({ automationId: z.string().uuid() }).parse(req.params);
        const data = z.object({
            name: z.string().min(1).optional(),
            nodes: z.array(z.any()).optional(),
            edges: z.array(z.any()).optional(),
            isActive: z.boolean().optional(),
        }).parse(req.body);

        const automation = await updateAutomation(automationId, data);
        res.json(automation);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Delete automation - Requires Paid Plan + Automation ownership
router.delete("/:automationId", requireAuth, requirePaidPlan, requireAutomationOwner, async (req, res) => {
    try {
        const { automationId } = z.object({ automationId: z.string().uuid() }).parse(req.params);
        await deleteAutomation(automationId);
        res.status(204).send();
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Activate automation - Requires Paid Plan + Automation ownership
router.post("/:automationId/activate", requireAuth, requirePaidPlan, requireAutomationOwner, async (req, res) => {
    try {
        const { automationId } = z.object({ automationId: z.string().uuid() }).parse(req.params);
        const automation = await activateAutomation(automationId);
        res.json(automation);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Deactivate automation - Requires Paid Plan + Automation ownership
router.post("/:automationId/deactivate", requireAuth, requirePaidPlan, requireAutomationOwner, async (req, res) => {
    try {
        const { automationId } = z.object({ automationId: z.string().uuid() }).parse(req.params);
        const automation = await deactivateAutomation(automationId);
        res.json(automation);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Get executions for automation - Requires Paid Plan + Automation ownership
router.get("/:automationId/executions", requireAuth, requirePaidPlan, requireAutomationOwner, async (req, res) => {
    try {
        const { automationId } = z.object({ automationId: z.string().uuid() }).parse(req.params);
        const executions = await getExecutionsByAutomation(automationId);
        res.json(executions);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;

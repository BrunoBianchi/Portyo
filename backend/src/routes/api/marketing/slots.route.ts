import { Router } from "express";
import { z } from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import * as SlotService from "../../../shared/services/marketing-slot.service";

const router: Router = Router();

// List user's slots - no ownerMiddleware needed, just auth
router.get("/", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    
    const slots = await SlotService.getSlotsByUser(userId);
    return res.status(200).json(slots);
});

// Create slot - no ownerMiddleware needed, just auth
const createSchema = z.object({
    bioId: z.string().uuid(),
    slotName: z.string().min(1).max(100),
    priceMin: z.number().min(0),
    priceMax: z.number().min(0),
    duration: z.number().int().min(1).max(365),
    acceptOtherPrices: z.boolean(),
    position: z.number().int().optional()
});

router.post("/", async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user.id;
        const data = createSchema.parse(req.body);
        
        const slot = await SlotService.createSlot(userId, data);
        return res.status(201).json(slot);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        console.error("Create slot error:", error);
        return res.status(500).json({ message: error.message || "Failed to create slot" });
    }
});

// Update slot
const updateSchema = z.object({
    slotName: z.string().min(1).max(100).optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    duration: z.number().int().min(1).max(365).optional(),
    acceptOtherPrices: z.boolean().optional(),
    position: z.number().int().optional()
});

router.put("/:id", ownerMiddleware, async (req, res) => {
    try {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        if (!req.user?.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user.id;
        const data = updateSchema.parse(req.body);
        
        const slot = await SlotService.updateSlot(id, userId, data);
        return res.status(200).json(slot);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        console.error("Update slot error:", error);
        return res.status(500).json({ message: error.message || "Failed to update slot" });
    }
});

// Delete slot
router.delete("/:id", ownerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    
    await SlotService.deleteSlot(id, userId);
    return res.status(204).send();
});

export default router;

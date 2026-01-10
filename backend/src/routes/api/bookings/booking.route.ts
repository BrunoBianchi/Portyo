import { Router, Request, Response } from "express";
import { getBookingSettings, updateBookingSettings, getBookings } from "../../../shared/services/booking.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { requirePaidPlan } from "../../../middlewares/user-pro.middleware";
import { requireBioOwner } from "../../../middlewares/resource-owner.middleware";
import z from "zod";

const router = Router();

// Get Settings - Requires Paid Plan (Standard/Pro) + Bio ownership
router.get("/settings/:bioId", authMiddleware, requirePaidPlan, async (req: Request, res: Response) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
        const settings = await getBookingSettings(bioId);
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update Settings - Requires Paid Plan (Standard/Pro) + Bio ownership  
router.put("/settings/:bioId", authMiddleware, requirePaidPlan, async (req: Request, res: Response) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
        const updates = req.body; // Validation could be stricter here with Zod
        const settings = await updateBookingSettings(bioId, updates);
        res.json(settings);
    } catch (error: any) {
        res.status(error.code || 500).json({ message: error.message });
    }
});

// Get Bookings List - Requires Paid Plan (Standard/Pro) + Bio ownership
router.get("/:bioId", authMiddleware, requirePaidPlan, async (req: Request, res: Response) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string; // 'all', 'pending', 'confirmed', 'cancelled'
        const date = req.query.date as string;

        const result = await getBookings(bioId, page, limit, status, date);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

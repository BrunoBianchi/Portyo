import { Router, Request, Response } from "express";
import { getBookingSettings, updateBookingSettings, getBookings } from "../../../shared/services/booking.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware"; // Middleware specific for routes
// Actually we can reuse isUserPro service check inside service, or use middleware.
// Let's use service logic since it's already there, but route protection is good too.
// For simplicity, relying on Service check (which I put in updateBookingSettings).
import z from "zod";

const router = Router();

// Get Settings
router.get("/settings/:bioId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { bioId } = req.params;
        const settings = await getBookingSettings(bioId);
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update Settings
router.put("/settings/:bioId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { bioId } = req.params;
        const updates = req.body; // Validation could be stricter here with Zod
        const settings = await updateBookingSettings(bioId, updates);
        res.json(settings);
    } catch (error: any) {
        res.status(error.code || 500).json({ message: error.message });
    }
});

// Get Bookings List
router.get("/:bioId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { bioId } = req.params;
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

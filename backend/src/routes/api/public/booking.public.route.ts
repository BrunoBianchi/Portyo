import { Router, Request, Response } from "express";
import { getAvailableSlots, createBooking, confirmBooking, cancelBooking, getBookingByToken } from "../../../shared/services/booking.service";
import z from "zod";

const router = Router();

// Get Slots
router.get("/:bioId/slots", async (req: Request, res: Response) => {
    try {
        const { bioId } = req.params;
        const { date } = req.query;
        
        if (!date || typeof date !== 'string') {
             return res.status(400).json({ message: "Date is required (YYYY-MM-DD)" });
        }

        const slots = await getAvailableSlots(bioId, date);
        res.json({ slots });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Public Booking Settings (for calendar UI)
router.get("/:bioId/settings", async (req: Request, res: Response) => {
    try {
        const { bioId } = req.params;
        const { getBookingSettings } = await import("../../../shared/services/booking.service");
        const settings = await getBookingSettings(bioId);
        
        // Only return what's needed for public calendar
        res.json({
            availability: settings.availability,
            blockedDates: settings.blockedDates || []
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create Booking
router.post("/:bioId/book", async (req: Request, res: Response) => {
    try {
        const { bioId } = req.params;
        const schema = z.object({
            date: z.string(),
            time: z.string(),
            name: z.string(),
            email: z.string().email(),
            phone: z.string().optional()
        });
        
        const data = schema.parse(req.body);
        const booking = await createBooking(bioId, data);
        
        // Trigger Automation
        const { triggerAutomation } = await import("../../../shared/services/automation.service");
        triggerAutomation(bioId, 'booking_created', {
            email: booking.customerEmail,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            bookingDate: booking.bookingDate.toISOString(),
            bookingNotes: booking.notes || ''
        }).catch(err => console.error("Failed to trigger booking automation", err));

        res.status(201).json(booking);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
             return res.status(400).json({ error: error.issues });
        }
        res.status(error.code || 500).json({ message: error.message });
    }
});

// Get Booking by Token (for management page)
router.get("/manage/:token", async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const booking = await getBookingByToken(token);
        // Return sanitized booking info (don't expose bio owner details)
        res.json({
            id: booking.id,
            bioId: booking.bioId,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            bookingDate: booking.bookingDate,
            status: booking.status,
            notes: booking.notes,
            bioName: booking.bio?.sufix || 'Unknown'
        });
    } catch (error: any) {
        res.status(error.code || 500).json({ message: error.message });
    }
});

// Confirm Booking
router.post("/confirm/:token", async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const booking = await confirmBooking(token);
        res.json({ message: "Booking confirmed!", booking });
    } catch (error: any) {
        res.status(error.code || 500).json({ message: error.message });
    }
});

// Cancel Booking
router.post("/cancel/:token", async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { reason } = req.body;
        const booking = await cancelBooking(token, reason);
        res.json({ message: "Booking cancelled", booking });
    } catch (error: any) {
        res.status(error.code || 500).json({ message: error.message });
    }
});

// Reschedule Booking
router.post("/reschedule/:token", async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { date, time, selfReschedule } = req.body;
        
        if (!date || !time) {
            return res.status(400).json({ message: "Date and time are required" });
        }
        
        const { rescheduleBooking } = await import("../../../shared/services/booking.service");
        const booking = await rescheduleBooking(token, date, time, selfReschedule === true);
        
        const message = selfReschedule 
            ? "Booking rescheduled and confirmed." 
            : "Booking rescheduled. Customer will receive an email to confirm.";
        
        res.json({ message, booking });
    } catch (error: any) {
        res.status(error.code || 500).json({ message: error.message });
    }
});

export default router;

import { Router } from "express";
import { getGoogleCalendarAuthUrl } from "../../../shared/services/google-calendar.service";

const router = Router();

router.get("/auth/:bioId", (req, res) => {
    try {
        const { bioId } = req.params;
        const url = getGoogleCalendarAuthUrl(bioId);
        res.redirect(url);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

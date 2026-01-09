import { Router } from "express";
import { parseGoogleCalendarCallback } from "../../../shared/services/google-calendar.service";

const router = Router();

router.get("/callback", async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) {
            return res.status(400).send("Missing code or state (bioId)");
        }

        const bioId = state as string;
        await parseGoogleCalendarCallback(code as string, bioId);

        // Close window or redirect back to dashboard
        res.send(`
            <script>
                window.opener.postMessage("google-calendar-connected", "*");
                window.close();
            </script>
        `);
    } catch (error: any) {
        console.error("Google Calendar Callback Error:", error);
        res.status(500).send("Authentication failed");
    }
});

export default router;

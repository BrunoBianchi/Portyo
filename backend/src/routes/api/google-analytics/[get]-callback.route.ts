import { Router } from "express";
import { parseGoogleAnalyticsCallback } from "../../../shared/services/google-analytics.service";

const router: Router = Router();

router.get("/", async (req, res) => {
    try {
        const code = req.query.code as string;
        const bioId = req.query.state as string;

        if (!code || !bioId) {
            res.status(400).send("Missing code or state");
            return;
        }

        await parseGoogleAnalyticsCallback(code, bioId);

        // Redirect to frontend
        res.redirect("http://localhost:5173/dashboard/integrations?google_analytics=connected");
    } catch (error) {
        console.error(error);
        res.redirect("http://localhost:5173/dashboard/integrations?google_analytics=error");
    }
});

export default router;

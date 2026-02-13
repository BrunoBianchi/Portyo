import { Router } from "express";
import { parseGoogleAnalyticsCallback } from "../../../shared/services/google-analytics.service";
import { decryptToken } from "../../../shared/services/jwt.service";
import { env } from "../../../config/env";

const router: Router = Router();

router.get("/", async (req, res) => {
    try {
        const code = req.query.code as string;
        const state = req.query.state as string;

        if (!code || !state) {
            res.status(400).send("Missing code or state");
            return;
        }

        const statePayload = await decryptToken(state);
        const bioId = (statePayload as any).bioId as string | undefined;
        const userId = (statePayload as any).id as string | undefined;
        const provider = (statePayload as any).provider as string | undefined;

        if (!bioId || !userId || provider !== "google-analytics") {
            res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?google_analytics=error`);
            return;
        }

        await parseGoogleAnalyticsCallback(code, bioId, userId);

        // Redirect to frontend
        res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?google_analytics=connected`);
    } catch (error) {
        console.error(error);
        res.redirect(`${env.FRONTEND_URL}/dashboard/integrations?google_analytics=error`);
    }
});

export default router;

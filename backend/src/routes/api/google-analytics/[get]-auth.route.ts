import { Router } from "express";
import { getGoogleAnalyticsAuthUrl } from "../../../shared/services/google-analytics.service";

const router: Router = Router();

router.get("/", async (req, res) => {
    try {
        // Assuming the user has a bio. We need to pass the bioId.
        // For now, let's assume the user has one bio or we pass it in query.
        // Or we get it from the user's active bio.
        // Let's assume req.query.bioId is passed.
        const bioId = req.query.bioId as string;
        if (!bioId) {
            res.status(400).json({ error: "Bio ID is required" });
            return;
        }

        // Check if user is on free plan
        if (!req.user || req.user.plan === 'free') {
            res.status(403).json({ error: "Google Analytics integration is only available for Standard and Pro plans." });
            return;
        }

        const url = getGoogleAnalyticsAuthUrl(bioId);
        res.json({ url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;

import { Router } from "express";
import { getGoogleAnalyticsAuthUrl } from "../../../shared/services/google-analytics.service";
import { generateToken } from "../../../shared/services/jwt.service";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";

const router: Router = Router();
const bioRepository = AppDataSource.getRepository(BioEntity);

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

        if (!req.user?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const bio = await bioRepository.findOne({
            where: {
                id: bioId,
                userId: req.user.id,
            },
        });

        if (!bio) {
            res.status(404).json({ error: "Bio not found" });
            return;
        }

        // Check if user is on free plan
        if (!req.user || (req.user.plan || 'free').toLowerCase() === 'free') {
            res.status(403).json({ error: "Google Analytics integration is only available for Standard and Pro plans." });
            return;
        }

        const state = await generateToken({
            id: req.user.id,
            bioId,
            provider: "google-analytics",
            type: "integration-state",
        });

        const url = getGoogleAnalyticsAuthUrl(state);
        res.json({ url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;

import { Router } from "express";
import { getAnalyticsProperties } from "../../../shared/services/google-analytics.service";
import { AppDataSource } from "../../../database/datasource";
import { IntegrationEntity } from "../../../database/entity/integration-entity";

const router: Router = Router();
const integrationRepository = AppDataSource.getRepository(IntegrationEntity);

router.get("/", async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const bioId = req.query.bioId as string;
        if (!bioId) {
            res.status(400).json({ error: "Bio ID is required" });
            return;
        }

        const integration = await integrationRepository.findOne({
            where: {
                bio: {
                    id: bioId,
                    userId: req.user.id,
                },
                provider: "google-analytics",
            },
        });

        if (!integration) {
            res.status(404).json({ error: "Integration not found" });
            return;
        }

        const properties = await getAnalyticsProperties(integration.id);
        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;

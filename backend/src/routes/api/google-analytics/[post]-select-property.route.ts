import { Router } from "express";
import { saveAnalyticsProperty } from "../../../shared/services/google-analytics.service";
import { AppDataSource } from "../../../database/datasource";
import { IntegrationEntity } from "../../../database/entity/integration-entity";

const router: Router = Router();
const integrationRepository = AppDataSource.getRepository(IntegrationEntity);

router.post("/", async (req, res) => {
    try {
        const { bioId, propertyId } = req.body;
        if (!bioId || !propertyId) {
            res.status(400).json({ error: "Bio ID and Property ID are required" });
            return;
        }

        const integration = await integrationRepository.findOne({
            where: { bio: { id: bioId }, provider: "google-analytics" }
        });

        if (!integration) {
            res.status(404).json({ error: "Integration not found" });
            return;
        }

        const updatedIntegration = await saveAnalyticsProperty(integration.id, propertyId);
        res.json(updatedIntegration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;

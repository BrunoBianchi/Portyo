import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { z } from "zod";
import { findBioById } from "../../../shared/services/bio.service";
import { UserEntity } from "../../../database/entity/user-entity";
import { disconnectIntegrationByProvider } from "../../../shared/services/integration.service";

const router: Router = Router();

router.delete("/disconnect", authMiddleware, async (req, res) => {
    try {
        const { bioId, provider } = z.object({
            bioId: z.string().uuid(),
            provider: z.string().min(1),
        }).parse(req.body);

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const bio = await findBioById(bioId, ["user"]);
        if (!bio) {
            return res.status(404).json({ message: "Bio not found" });
        }

        if ((bio.user as UserEntity).id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const disconnected = await disconnectIntegrationByProvider(bioId, provider);
        if (!disconnected) {
            return res.status(404).json({ message: "Integration not found" });
        }

        return res.json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;

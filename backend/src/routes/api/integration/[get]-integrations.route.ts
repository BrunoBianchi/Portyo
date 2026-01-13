import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { z } from "zod";
import { findBioById } from "../../../shared/services/bio.service";
import { UserEntity } from "../../../database/entity/user-entity";
import { getIntegrationsByBioId } from "../../../shared/services/integration.service";

const router: Router = Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.query);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not Authenticated" });

        const bio = await findBioById(bioId, ['user']);
        if (!bio) return res.status(404).json({ message: "Bio not found" });
        if ((bio.user as UserEntity).id !== userId) return res.status(403).json({ message: "Unauthorized" });

        const integrations = await getIntegrationsByBioId(bioId);
        res.json(integrations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

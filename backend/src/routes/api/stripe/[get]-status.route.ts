import { Router } from "express";
import { getStripeAccountStatus } from "../../../shared/services/stripe.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { z } from "zod";
import { findBioById } from "../../../shared/services/bio.service";
import { UserEntity } from "../../../database/entity/user-entity";

const router: Router = Router();

router.get("/status", authMiddleware, async (req, res) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.query);
        const userId = req.session.user!.id;

        const bio = await findBioById(bioId, ['user']);
        if (!bio) return res.status(404).json({ message: "Bio not found" });
        if ((bio.user as UserEntity).id !== userId) return res.status(403).json({ message: "Unauthorized" });

        const status = await getStripeAccountStatus(bioId);
        res.json(status);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

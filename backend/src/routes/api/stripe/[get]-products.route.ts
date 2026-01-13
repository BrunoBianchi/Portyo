import { Router } from "express";
import { getStripeProducts } from "../../../shared/services/stripe.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { z } from "zod";
import { findBioById } from "../../../shared/services/bio.service";
import { UserEntity } from "../../../database/entity/user-entity";

const router: Router = Router();

router.get("/products", authMiddleware, async (req, res) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.query);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not Authenticated" });

        const bio = await findBioById(bioId, ['user']);
        if (!bio) return res.status(404).json({ message: "Bio not found" });
        if ((bio.user as UserEntity).id !== userId) return res.status(403).json({ message: "Unauthorized" });

        const products = await getStripeProducts(bioId);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

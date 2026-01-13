import { Router } from "express";
import { createLoginLink } from "../../../shared/services/stripe.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { z } from "zod";
import { findBioById } from "../../../shared/services/bio.service";
import { UserEntity } from "../../../database/entity/user-entity";

const router: Router = Router();

router.post("/login-link", authMiddleware, async (req, res) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.body);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not Authenticated" });

        const bio = await findBioById(bioId, ['user']);
        if (!bio) return res.status(404).json({ message: "Bio not found" });
       if ((bio.user as UserEntity).id !== userId) return res.status(403).json({ message: "Unauthorized" });

        const url = await createLoginLink(bioId);
        res.json({ url });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

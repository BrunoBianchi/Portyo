import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { BillingService } from "../../../services/billing.service";
import { AppDataSource } from "../../../database/datasource";
import { BillingEntity } from "../../../database/entity/billing-entity";

const router: Router = Router();

router.get("/history", authMiddleware, async (req, res) => {
    const userId = req.user?.id || req.session?.user?.id;
    if (!userId) return res.status(401).send("Unauthorized");

    try {
        const history = await AppDataSource.getRepository(BillingEntity).find({
            where: { userId },
            order: { startDate: "DESC" }
        });

        res.status(200).json(history);
    } catch (error) {
        console.error("Failed to fetch billing history", error);
        res.status(500).json({ error: "Failed to fetch billing history" });
    }
});

export default router;

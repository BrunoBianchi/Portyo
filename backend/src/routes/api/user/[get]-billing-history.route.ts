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
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [history, total] = await AppDataSource.getRepository(BillingEntity).findAndCount({
            where: { userId },
            order: { startDate: "DESC" },
            take: limit,
            skip: skip
        });

        res.status(200).json({
            data: history,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Failed to fetch billing history", error);
        res.status(500).json({ error: "Failed to fetch billing history" });
    }
});

export default router;

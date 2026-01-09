import { Router } from "express";
import { getStripeProducts } from "../../../shared/services/stripe.service";
import { z } from "zod";

const router: Router = Router();

router.get("/:bioId", async (req, res) => {
    try {
        const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
        const products = await getStripeProducts(bioId);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

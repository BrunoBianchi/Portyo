import { Router } from "express";
import { updateStripeProduct } from "../../../shared/services/stripe.service";
import { z } from "zod";

const router = Router();

router.put("/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const { bioId, title, price, currency, image, active } = req.body;

        if (!bioId) {
            return res.status(400).json({ message: "Bio ID is required" });
        }

        const product = await updateStripeProduct(bioId, productId, {
            title,
            price,
            currency,
            image,
            active
        });

        res.json(product);
    } catch (error: any) {
        console.error("Failed to update product:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;

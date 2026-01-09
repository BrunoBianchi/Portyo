import { Router } from "express";
import { archiveStripeProduct } from "../../../shared/services/stripe.service";

const router = Router();

router.delete("/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const { bioId } = req.body; // or query, typically DELETE body is allowed but sometimes query is safer for simple IDs

        if (!bioId) {
            return res.status(400).json({ message: "Bio ID is required" });
        }

        const product = await archiveStripeProduct(bioId, productId);

        res.json(product);
    } catch (error: any) {
        console.error("Failed to archive product:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;

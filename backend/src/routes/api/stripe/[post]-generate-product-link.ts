import { Router, Request, Response } from "express";
import { createProductLink } from "../../../shared/services/stripe.service";
import { z } from "zod";

const router = Router();

const generateProductLinkSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    bioId: z.string().uuid("Invalid Bio ID format"),
});

router.post("/generate-product-link", async (req: Request, res: Response) => {
    try {
        const validationResult = generateProductLinkSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({ 
                message: "Validation error", 
                errors: validationResult.error.format() 
            });
        }

        const { productId, bioId } = validationResult.data;

        const paymentLink = await createProductLink(productId, bioId);
        
        return res.status(200).json(paymentLink);
    } catch (error: any) {
        console.error("Error generating product link:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
});

export default router;

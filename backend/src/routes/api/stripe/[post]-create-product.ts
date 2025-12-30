import { Router, Request, Response } from "express";
import { createStripeProduct } from "../../../shared/services/stripe.service";
import { z } from "zod";

const router = Router();

const createProductSchema = z.object({
    bioId: z.string().min(1, "Bio ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    price: z.number().min(0.5, "Price must be at least 0.50"),
    currency: z.string().default("usd"),
    image: z.string().url().optional().or(z.literal("")),
});

router.post("/create-product", async (req: Request, res: Response) => {
    try {
        const validationResult = createProductSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({ 
                message: "Validation error", 
                errors: validationResult.error.format() 
            });
        }

        const { bioId, title, description, price, currency, image } = validationResult.data;

        const product = await createStripeProduct(bioId, {
            title,
            description,
            price,
            currency,
            image: image || undefined,
        });
        return res.json(product);
    } catch (error: any) {
        console.error("Error creating product:", error);
        return res.status(400).json({ error: error.message });
    }
});

export default router;

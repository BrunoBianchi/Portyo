import express, { NextFunction, Request, Response } from "express";
import { formService } from "../../../services/form.service";
import z, { ZodError } from "zod";
import { verifyFormOwner } from "../../../middlewares/form.middleware";

const router = express.Router();

const updateFormSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  fields: z.array(z.any()).optional(),
});

router.patch("/forms/:id", verifyFormOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updateFormSchema.parse(req.body);
        const form = await formService.update(id, body);
        res.json(form);
    } catch (error) {
        if (error instanceof ZodError) {
             return res.status(400).json({ error: error.issues });
        }
        next(error);
    }
});

export default router;

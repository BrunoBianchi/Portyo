import express, { NextFunction, Request, Response } from "express";
import { formService } from "../../../services/form.service";
import z, { ZodError } from "zod";
import { verifyBioOwner } from "../../../middlewares/form.middleware";

const router = express.Router();

const createFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fields: z.array(z.any()).optional(),
});

router.post("/bios/:bioId/forms", verifyBioOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bioId } = req.params;
        // @ts-ignore
        const userId = (req.user as any).id;
        
        // userId check handled by middleware now, but keeping for type safety in service call

        const body = createFormSchema.parse(req.body);

        const form = await formService.create(bioId, userId, body);
        res.status(201).json(form);
    } catch (error: any) {
        if (error instanceof ZodError) {
             return res.status(400).json({ error: error.issues });
        }
        next(error);
    }
});

export default router;

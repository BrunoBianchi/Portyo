import express, { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";
import { pollService } from "../../../services/poll.service";
import { verifyPollOwner } from "../../../middlewares/poll.middleware";

const router = express.Router();

const pollOptionSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
});

const updatePollSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    options: z.array(pollOptionSchema).min(2).optional(),
    isActive: z.boolean().optional(),
    allowMultipleChoices: z.boolean().optional(),
    requireName: z.boolean().optional(),
    requireEmail: z.boolean().optional(),
    showResultsPublic: z.boolean().optional(),
    chartType: z.enum(["bar", "pie", "donut"]).optional(),
    chartColors: z.array(z.string().regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)).min(1).max(12).optional(),
    startsAt: z.string().datetime().optional().nullable(),
    endsAt: z.string().datetime().optional().nullable(),
});

router.patch("/polls/:id", verifyPollOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updatePollSchema.parse(req.body);
        const poll = await pollService.update(id, body as any);
        res.json(poll);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        next(error);
    }
});

export default router;

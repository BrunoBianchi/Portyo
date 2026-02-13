import express, { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";
import { pollService } from "../../../services/poll.service";
import { verifyPollBioOwner } from "../../../middlewares/poll.middleware";

const router = express.Router();

const pollOptionSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
});

const createPollSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    options: z.array(pollOptionSchema).min(2, "At least 2 options are required"),
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

router.post("/bios/:bioId/polls", verifyPollBioOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bioId } = req.params;
        const body = createPollSchema.parse(req.body);
        const poll = await pollService.create(bioId, body as any);
        res.status(201).json(poll);
    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        next(error);
    }
});

export default router;

import { Router } from "express";
import { z } from "zod";
import { pollService } from "../../../../services/poll.service";

export const publicVotePollRoute = Router();

const voteSchema = z.object({
    optionIds: z.array(z.string().min(1)).min(1),
    name: z.string().optional(),
    email: z.string().email().optional(),
});

publicVotePollRoute.post("/:id/vote", async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = voteSchema.parse(req.body);
        const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
        const userAgent = req.headers["user-agent"] || "";

        const result = await pollService.vote(
            id,
            body,
            {
                ip: ipAddress,
                userAgent,
            }
        );

        res.json(result);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", issues: error.issues });
            return;
        }

        if (error?.statusCode) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }

        next(error);
    }
});

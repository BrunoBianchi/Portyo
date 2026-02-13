import { Router } from "express";
import { pollService } from "../../../../services/poll.service";

export const publicPollResultsRoute = Router();

publicPollResultsRoute.get("/:id/results", async (req, res, next) => {
    try {
        const { id } = req.params;
        const poll = await pollService.findPublic(id);

        if (!poll) {
            res.status(404).json({ message: "Poll not found" });
            return;
        }

        if (!poll.showResultsPublic) {
            res.status(403).json({ message: "Results are hidden for this poll" });
            return;
        }

        const results = await pollService.getResults(id);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

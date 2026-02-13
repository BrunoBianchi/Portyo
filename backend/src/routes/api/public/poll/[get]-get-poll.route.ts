import { Router } from "express";
import { pollService } from "../../../../services/poll.service";

export const publicGetPollRoute = Router();

publicGetPollRoute.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const poll = await pollService.findPublic(id);

        if (!poll) {
            res.status(404).json({ message: "Poll not found" });
            return;
        }

        res.json({
            id: poll.id,
            title: poll.title,
            description: poll.description,
            options: poll.options,
            chartType: poll.chartType,
            chartColors: poll.chartColors,
            allowMultipleChoices: poll.allowMultipleChoices,
            requireName: poll.requireName,
            requireEmail: poll.requireEmail,
            showResultsPublic: poll.showResultsPublic,
            startsAt: poll.startsAt,
            endsAt: poll.endsAt,
            isActive: poll.isActive,
        });
    } catch (error) {
        next(error);
    }
});

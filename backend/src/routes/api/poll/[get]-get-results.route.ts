import express, { NextFunction, Request, Response } from "express";
import { pollService } from "../../../services/poll.service";
import { verifyPollOwner } from "../../../middlewares/poll.middleware";

const router = express.Router();

router.get("/polls/:id/results", verifyPollOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const results = await pollService.getResults(id);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

export default router;

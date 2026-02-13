import express, { NextFunction, Request, Response } from "express";
import { pollService } from "../../../services/poll.service";
import { verifyPollOwner } from "../../../middlewares/poll.middleware";

const router = express.Router();

router.get("/polls/:id", verifyPollOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const poll = await pollService.findOne(id);
        if (!poll) return res.status(404).json({ error: "Poll not found" });
        res.json(poll);
    } catch (error) {
        next(error);
    }
});

export default router;

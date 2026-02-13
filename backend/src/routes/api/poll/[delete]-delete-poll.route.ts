import express, { NextFunction, Request, Response } from "express";
import { pollService } from "../../../services/poll.service";
import { verifyPollOwner } from "../../../middlewares/poll.middleware";

const router = express.Router();

router.delete("/polls/:id", verifyPollOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await pollService.delete(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;

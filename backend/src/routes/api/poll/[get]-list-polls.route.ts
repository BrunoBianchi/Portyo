import express, { NextFunction, Request, Response } from "express";
import { pollService } from "../../../services/poll.service";
import { verifyPollBioOwner } from "../../../middlewares/poll.middleware";

const router = express.Router();

router.get("/bios/:bioId/polls", verifyPollBioOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bioId } = req.params;
        const polls = await pollService.findAllByBio(bioId);
        res.json(polls);
    } catch (error) {
        next(error);
    }
});

export default router;

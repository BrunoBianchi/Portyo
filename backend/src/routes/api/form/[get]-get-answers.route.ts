import express, { NextFunction, Request, Response } from "express";
import { formService } from "../../../services/form.service";
import { verifyFormOwner } from "../../../middlewares/form.middleware";

const router = express.Router();

router.get("/forms/:id/answers", verifyFormOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const answers = await formService.getAnswers(id);
        res.json(answers);
    } catch (error) {
        next(error);
    }
});

export default router;

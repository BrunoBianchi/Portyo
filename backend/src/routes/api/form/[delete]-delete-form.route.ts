import express, { NextFunction, Request, Response } from "express";
import { formService } from "../../../services/form.service";
import { verifyFormOwner } from "../../../middlewares/form.middleware";

const router = express.Router();

router.delete("/forms/:id", verifyFormOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await formService.delete(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;

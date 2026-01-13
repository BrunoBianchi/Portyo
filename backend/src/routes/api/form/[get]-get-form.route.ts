import express, { NextFunction, Request, Response } from "express";
import { formService } from "../../../services/form.service";
import { verifyFormOwner } from "../../../middlewares/form.middleware";

const router = express.Router();

router.get("/forms/:id", verifyFormOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const form = await formService.findOne(id);
        if (!form) return res.status(404).json({ error: "Form not found" });
        res.json(form);
    } catch (error) {
        next(error);
    }
});

export default router;

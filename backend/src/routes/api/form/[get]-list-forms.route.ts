import express, { NextFunction, Request, Response } from "express";
import { formService } from "../../../services/form.service";
import { verifyBioOwner } from "../../../middlewares/form.middleware";

const router = express.Router();

router.get("/bios/:bioId/forms", verifyBioOwner, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bioId } = req.params;
        const forms = await formService.findAll(bioId);
        res.json(forms);
    } catch (error) {
        next(error);
    }
});

export default router;

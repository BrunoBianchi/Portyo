import { Router } from "express";
import { getEmailsFromBio } from "../../../shared/services/email.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { z } from "zod";

const router: Router = Router();

router.get("/:id", ownerMiddleware, async (req, res) => {
    try {
        const { id } = z.object({ id: z.string() }).parse(req.params);
        const emails = await getEmailsFromBio(id);
        res.status(200).json(emails);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;

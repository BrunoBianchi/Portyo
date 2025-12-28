import { Router } from "express";
import { addEmail } from "../../../shared/services/email.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { z } from "zod";

const router: Router = Router();

router.post("/:id", ownerMiddleware, async (req, res) => {
    try {
        const { id } = z.object({ id: z.string() }).parse(req.params);
        const { email } = z.object({ email: z.string().email() }).parse(req.body);

        const result = await addEmail(email, id);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;

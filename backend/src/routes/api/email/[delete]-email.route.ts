
import { Router } from "express";
import { removeEmail } from "../../../shared/services/email.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { z } from "zod";

const router: Router = Router();

router.delete("/:id", ownerMiddleware, async (req, res) => {
    try {
        const { id } = z.object({ id: z.string() }).parse(req.params);
        const { email } = z.object({ email: z.string().email() }).parse(req.body);

        await removeEmail(email, id);
        res.status(200).json({ message: "Email removed successfully" });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;

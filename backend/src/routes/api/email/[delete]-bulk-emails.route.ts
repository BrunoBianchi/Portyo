
import { Router } from "express";
import { removeEmails } from "../../../shared/services/email.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { z } from "zod";

const router: Router = Router();

router.delete("/:id/bulk", ownerMiddleware, async (req, res) => {
    try {
        const { id } = z.object({ id: z.string() }).parse(req.params);
        const { emails } = z.object({ emails: z.array(z.string().email()) }).parse(req.body);

        await removeEmails(emails, id);
        res.status(200).json({ message: "Emails removed successfully" });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default router;

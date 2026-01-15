import { Router } from "express";
import z from "zod";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { deleteMarketingBlock } from "../../../shared/services/marketing.service";

const router: Router = Router();

router.delete("/:id", ownerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    if (!req.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    
    await deleteMarketingBlock(id, userId);
    
    return res.status(204).send();
});

export default router;

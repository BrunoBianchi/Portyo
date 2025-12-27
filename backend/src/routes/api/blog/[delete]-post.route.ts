import { Router } from "express";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { blogOwnerMiddleware } from "../../../middlewares/blog-owner.middleware";
import { deletePost } from "../../../shared/services/blog.service";

const router: Router = Router();

router.delete("/:id", authMiddleware, blogOwnerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    await deletePost(id);
    return res.status(200).send();
});

export default router;

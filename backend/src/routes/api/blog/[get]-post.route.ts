import { Router } from "express";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { blogOwnerMiddleware } from "../../../middlewares/blog-owner.middleware";
import { getPostById } from "../../../shared/services/blog.service";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

router.get("/:id", async (req, res) => {
     const { id } = z.object({ id: z.string() }).parse(req.params);
     const post = await getPostById(id);

     if (!post) throw new ApiError(APIErrors.notFoundError, "Post not found", 404);

     // If public view, check status
     // We can check session here too if we want to allow owner to see drafts
     let isOwner = false;
     if (req.session && req.session.user) {
         // @ts-ignore
         if (post.user.id === req.session.user.id) {
             isOwner = true;
         }
     }

     if (!isOwner) {
         if (post.status !== 'published') {
             // If scheduled, check date
             if (post.status === 'scheduled' && post.scheduledAt && new Date(post.scheduledAt) > new Date()) {
                 throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
             }
             if (post.status === 'draft') {
                 throw new ApiError(APIErrors.notFoundError, "Post not found", 404);
             }
         }
     }

     return res.status(200).json(post);
});

export default router;

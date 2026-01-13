import { Router } from "express";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { blogOwnerMiddleware } from "../../../middlewares/blog-owner.middleware";
import { updatePost } from "../../../shared/services/blog.service";

const router: Router = Router();

const updatePostSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    keywords: z.string().optional(),
    status: z.string().optional(),
    scheduledAt: z.string().optional().nullable(),
    thumbnail: z.string().optional().nullable(),
});

router.put("/:id", authMiddleware, blogOwnerMiddleware, async (req, res) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    console.log("[UpdatePost] Received body for id", id, ":", JSON.stringify(req.body, null, 2));
    const postData = updatePostSchema.parse(req.body);
    
    const post = await updatePost(id, {
        ...postData,
        scheduledAt: postData.scheduledAt ? new Date(postData.scheduledAt) : (postData.scheduledAt === null ? null : undefined)
    });
    return res.status(200).json(post);
});

export default router;

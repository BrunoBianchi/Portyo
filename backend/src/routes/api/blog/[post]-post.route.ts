import { Router } from "express";
import z from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { createPost } from "../../../shared/services/blog.service";

const router: Router = Router();

const createPostSchema = z.object({
    title: z.string(),
    content: z.string(),
    keywords: z.string(),
    status: z.string(),
    bioId: z.string(),
    scheduledAt: z.string().optional().nullable(),
});

router.post("/", authMiddleware, async (req, res) => {
    const postData = createPostSchema.parse(req.body);
    const userId = req.session.user!.id;
    
    const post = await createPost({
        ...postData,
        scheduledAt: postData.scheduledAt ? new Date(postData.scheduledAt) : null
    }, userId as string, postData.bioId);
    return res.status(201).json(post);
});

export default router;

import { Router, Request, Response } from "express";
import { getPostsByBio } from "../../../shared/services/blog.service";
import { z } from "zod";

const router: Router = Router();

router.get("/:bioId", async (req: Request, res: Response) => {
    try {
        const { bioId } = z.object({ bioId: z.string().uuid() }).parse(req.params);
        const posts = await getPostsByBio(bioId, true);
        return res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching public posts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Get single post by ID (for blog post detail page)
router.get("/post/:postId", async (req: Request, res: Response) => {
    try {
        const { postId } = z.object({ postId: z.string().uuid() }).parse(req.params);
        
        const { getPostById } = await import("../../../shared/services/blog.service");
        const post = await getPostById(postId);
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Check if published
        if (post.status !== 'published') {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Check scheduled date
        if (post.scheduledAt && new Date(post.scheduledAt) > new Date()) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        return res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

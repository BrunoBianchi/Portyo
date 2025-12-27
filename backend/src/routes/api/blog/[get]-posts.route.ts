import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { getPostsByBio } from "../../../shared/services/blog.service";
import { findBioById } from "../../../shared/services/bio.service";
import z from "zod";

const router: Router = Router();

router.get("/:bioId", async (req, res) => {
    const { bioId } = z.object({ bioId: z.string() }).parse(req.params);
    
    // Check if user is authenticated and owns the bio
    let isOwner = false;
    if (req.session && req.session.user) {
        const bio = await findBioById(bioId);
        // @ts-ignore
        if (bio && bio.userId === req.session.user.id) {
            isOwner = true;
        }
    }

    // If owner, return all posts. If not, return only published and scheduled <= now
    const posts = await getPostsByBio(bioId, !isOwner);
    return res.status(200).json(posts);
});

export default router;

import { Router } from "express";
import { getPublicSitePosts, getPublicSitePost } from "../../../controllers/site-post.controller";

const router = Router();

router.get("/", getPublicSitePosts);
router.get("/:id", getPublicSitePost);

export default router;

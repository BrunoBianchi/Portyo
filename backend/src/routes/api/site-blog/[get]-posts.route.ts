import { Router } from "express";
import { getSitePosts } from "../../../controllers/site-post.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireSiteAdmin } from "../../../middlewares/site-admin.middleware";

const router = Router();

router.get("/", requireAuth, requireSiteAdmin, getSitePosts);

export default router;

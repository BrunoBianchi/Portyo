import { Router } from "express";
import { createSitePost } from "../../../controllers/site-post.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireSiteAdmin } from "../../../middlewares/site-admin.middleware";

const router = Router();

router.post("/", requireAuth, requireSiteAdmin, createSitePost);

export default router;

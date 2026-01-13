import { Router } from "express";
import { updateSitePost } from "../../../controllers/site-post.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireSiteAdmin } from "../../../middlewares/site-admin.middleware";

const router = Router();

router.put("/:id", requireAuth, requireSiteAdmin, updateSitePost);

export default router;

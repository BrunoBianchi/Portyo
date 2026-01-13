import { Router } from "express";
import { deleteSitePost } from "../../../controllers/site-post.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { requireSiteAdmin } from "../../../middlewares/site-admin.middleware";

const router = Router();

router.delete("/:id", requireAuth, requireSiteAdmin, deleteSitePost);

export default router;

import { Router } from "express";
import { getLatestPosts, getProxyImage } from "../../../controllers/instagram.controller";

const router: Router = Router();

router.get("/proxy", getProxyImage);
router.get("/:username", getLatestPosts);

export default router;

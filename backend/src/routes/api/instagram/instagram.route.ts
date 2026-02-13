import { Router } from "express";
import { getLatestPosts, getProxyImage, getImage, initiateAuth, handleCallback } from "../../../controllers/instagram.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router: Router = Router();

router.get("/auth", authMiddleware, initiateAuth);
router.get("/auth/callback", handleCallback);
router.get("/proxy", getProxyImage);
router.get("/image/:shortcode", getImage);
router.get("/:username", getLatestPosts);

export default router;

import { Router } from "express";
import { getLatestPosts, getProxyImage, getImage, initiateAuth, handleCallback } from "../../../controllers/instagram.controller";

const router: Router = Router();

router.get("/auth", (req, res, next) => {
	if (typeof req.query.code === "string" || typeof req.query.error === "string") {
		return handleCallback(req, res, next);
	}
	return initiateAuth(req, res, next);
});
router.get("/auth/callback", handleCallback);
router.get("/proxy", getProxyImage);
router.get("/image/:shortcode", getImage);
router.get("/:username", getLatestPosts);

export default router;

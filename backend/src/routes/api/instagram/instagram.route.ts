import { Router } from "express";
import { getLatestPosts, getProxyImage, getImage, initiateAuth, handleCallback, verifyWebhook, receiveWebhook, getAutoReplyConfig, saveAutoReplyConfig, publishAutoReplyConfig, getInstagramPostIdeas, getWebhookConfig } from "../../../controllers/instagram.controller";
import { requireAuth } from "../../../middlewares/auth.middleware";

const router: Router = Router();

router.get("/auth", (req, res, next) => {
	if (typeof req.query.code === "string" || typeof req.query.error === "string") {
		return handleCallback(req, res, next);
	}
	return initiateAuth(req, res, next);
});
router.get("/auth/callback", handleCallback);
router.get("/webhook", verifyWebhook);
router.post("/webhook", receiveWebhook);
router.get("/webhook/config", requireAuth, getWebhookConfig);
router.get("/auto-reply/:bioId", requireAuth, getAutoReplyConfig);
router.put("/auto-reply/:bioId", requireAuth, saveAutoReplyConfig);
router.post("/auto-reply/:bioId/publish", requireAuth, publishAutoReplyConfig);
router.get("/post-ideas/:bioId", requireAuth, getInstagramPostIdeas);
router.get("/proxy", getProxyImage);
router.get("/image/:shortcode", getImage);
router.get("/:username", getLatestPosts);

export default router;

import { Router } from "express";
import { getLatestPosts, getLatestPostsByBioId, handleCallback, initiateAuth } from "../../../controllers/instagram.controller";

const router: Router = Router();

router.get("/auth", (req, res, next) => {
	if (typeof req.query.code === "string" || typeof req.query.error === "string") {
		return handleCallback(req, res, next);
	}
	return initiateAuth(req, res, next);
});

router.get("/auth/callback", handleCallback);

router.get("/feed/:bioId", getLatestPostsByBioId);

router.get("/:username", getLatestPosts);

export default router;

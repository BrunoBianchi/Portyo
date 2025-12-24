import { Router } from "express";
import { getLatestVideos } from "../../../controllers/youtube.controller";

const router: Router = Router();

router.get("/:username", getLatestVideos);

export default router;

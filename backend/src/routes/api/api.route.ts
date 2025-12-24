import { Router } from "express";
import userRoute from "./user/user.route"
import bioRoute from "./bio/bio.route"
import publicBioRoute from "./public/bio.public.route"
import instagramRoute from "./instagram/instagram.route"
import youtubeRoute from "./youtube/youtube.route"
import { authMiddleware } from "../../middlewares/auth.middleware";
const router: Router = Router();
router.use('/user',userRoute);
router.use('/bio',authMiddleware,bioRoute)
router.use('/public/bio', publicBioRoute)
router.use('/public/instagram', instagramRoute)
router.use('/public/youtube', youtubeRoute)

export default router;
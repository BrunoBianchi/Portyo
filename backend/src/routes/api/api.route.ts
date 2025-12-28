import { Router } from "express";
import userRoute from "./user/user.route"
import bioRoute from "./bio/bio.route"
import blogRoute from "./blog/blog.route"
import publicBioRoute from "./public/bio.public.route"
import instagramRoute from "./instagram/instagram.route"
import youtubeRoute from "./youtube/youtube.route"
import publicEmailRoute from "./public/email.public.route"
import QrRoute from "./qrcode/qrcode.route"
import emailRoute from "./email/email.route"
import { authMiddleware } from "../../middlewares/auth.middleware";
const router: Router = Router();
router.use('/user',userRoute);
router.use('/bio',authMiddleware,bioRoute)
router.use('/blog',blogRoute)
router.use('/public/bio', publicBioRoute)
router.use('/public/instagram', instagramRoute)
router.use('/public/youtube', youtubeRoute)
router.use('/public/email', publicEmailRoute)
router.use('/qrcode/',authMiddleware ,QrRoute)
router.use('/email', authMiddleware, emailRoute)
export default router;
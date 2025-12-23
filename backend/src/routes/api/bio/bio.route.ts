import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import getBio from "./[get]-bio.route"
import getBios from "./[get]-bios.route"
import createBio from "./[post]-bio.route"
const router: Router = Router();
router.use(authMiddleware,getBio)
router.use(authMiddleware,getBios)
router.use(authMiddleware,createBio)
export default router;
import { Router } from "express";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import getBio from "./[get]-bio.route"
import getBios from "./[get]-bios.route"
import createBio from "./[post]-bio.route"
import updateBio from "./[post]-update-bio"
const router: Router = Router();
router.use(getBio)
router.use(getBios)
router.use(createBio)
router.use(updateBio)

export default router;
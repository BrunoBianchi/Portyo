import { Router } from "express";
import userRoute from "./user/user.route"
import bioRoute from "./bio/bio.route"
const router: Router = Router();
router.use('/user',userRoute);
router.use('/bio',bioRoute)
export default router;
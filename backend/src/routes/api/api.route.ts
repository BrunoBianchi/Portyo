import { Router } from "express";
import userRoute from "./user/user.route"

const router: Router = Router();
router.use('/user',userRoute);

export default router;
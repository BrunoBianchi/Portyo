import { Router } from "express";
import authRoute from "./[get]-auth.route";
import callbackRoute from "./[get]-callback.route";

const router: Router = Router();

router.use(authRoute);
router.use(callbackRoute);

export default router;

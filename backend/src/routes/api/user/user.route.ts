import { Router } from "express";
import createNewUserRoute from "./[post]-create-new-user.route";

const router: Router = Router();
router.use(createNewUserRoute);

export default router;
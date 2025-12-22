import { Router } from "express";
import createNewUserRoute from "./[post]-create-new-user.route";
import meRoute from "./[get]-me.route"
const router: Router = Router();
router.use(createNewUserRoute);
router.use(meRoute)
export default router;
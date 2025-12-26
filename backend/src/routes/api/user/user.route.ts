import { Router } from "express";
import createNewUserRoute from "./[post]-create-new-user.route";
import meRoute from "./[get]-me.route"
import loginRoute from "./[post]-login.route"
import uploadPhotoRoute from "./[post]-upload-photo.route"
const router: Router = Router();
router.use(createNewUserRoute);
router.use(meRoute)
router.use(loginRoute)
router.use(uploadPhotoRoute)
export default router;
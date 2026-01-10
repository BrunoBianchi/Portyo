import { Router } from "express";
import createNewUserRoute from "./[post]-create-new-user.route";
import meRoute from "./[get]-me.route"
import loginRoute from "./[post]-login.route"
import uploadPhotoRoute from "./[post]-upload-photo.route"
import billingHistoryRoute from "./[get]-billing-history.route"
const router: Router = Router();
router.use(createNewUserRoute);
router.use(meRoute)
router.use(loginRoute)
router.use(uploadPhotoRoute)
router.use("/billing", billingHistoryRoute) // Mounting at /user/billing/history
export default router;
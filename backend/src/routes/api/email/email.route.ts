import { Router } from "express";
import addEmailRoute from "./[post]-add-email.route";
import getEmailsRoute from "./[get]-emails.route";

const router: Router = Router();

router.use(addEmailRoute);
router.use(getEmailsRoute);

export default router;

import { Router } from "express";
import addEmailRoute from "./[post]-add-email.route";
import getEmailsRoute from "./[get]-emails.route";
import deleteEmailRoute from "./[delete]-email.route";
import bulkDeleteEmailRoute from "./[delete]-bulk-emails.route";

const router: Router = Router();

router.use(addEmailRoute);
router.use(getEmailsRoute);
router.use(deleteEmailRoute);
router.use(bulkDeleteEmailRoute);

export default router;

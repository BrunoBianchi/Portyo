import { Router } from "express";
import listFormsRoute from "./[get]-list-forms.route";
import createFormRoute from "./[post]-create-form.route";
import getFormRoute from "./[get]-get-form.route";
import updateFormRoute from "./[patch]-update-form.route";
import deleteFormRoute from "./[delete]-delete-form.route";
import getAnswersRoute from "./[get]-get-answers.route";
import { authMiddleware } from "../../../middlewares";

const router: Router = Router();

router.use(listFormsRoute,authMiddleware);
router.use(createFormRoute,authMiddleware);
router.use(getFormRoute,authMiddleware);
router.use(updateFormRoute,authMiddleware);
router.use(deleteFormRoute,authMiddleware);
router.use(getAnswersRoute,authMiddleware);

export default router;

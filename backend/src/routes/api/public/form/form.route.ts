
import { Router } from "express";
import { publicGetFormRoute } from "./[get]-get-form.route";
import { publicSubmitRoute } from "./[post]-submit-form.route";

const router = Router();

router.use("/", publicGetFormRoute);
router.use("/", publicSubmitRoute);

export default router;

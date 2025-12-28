import { Router, Request, Response, NextFunction } from "express";
import createRoute from "./[post]-create.route"
import getQrCodeRoute from "./[get]-qrcode.route"
import getAllQrCodesRoute from "./[get]-qrcodes.route"

import { ownerMiddleware } from "../../../middlewares/owner.middleware";
const router: Router = Router();
router.use(createRoute)
router.use(getQrCodeRoute)
router.use(getAllQrCodesRoute)

export default router;
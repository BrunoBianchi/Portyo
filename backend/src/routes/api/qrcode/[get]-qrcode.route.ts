import { Router, Request, Response, NextFunction } from "express";
import z from "zod"
import {  getQrCodeById } from "../../../shared/services/qrcode.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
const router: Router = Router();

router.get("/:id/qrcode/:qrcodeId", ownerMiddleware, async(req: Request, res: Response) => {
    const schema = z.object({
      qrcodeId: z.string()
    }).parse(req.params)
    return res.status(200).json(await getQrCodeById(schema.qrcodeId))

})



export default router;
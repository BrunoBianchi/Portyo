import { Router, Request, Response, NextFunction } from "express";
import z from "zod"
import { createQrCode, getAllQrCodes } from "../../../shared/services/qrcode.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
const router: Router = Router();

router.get("/:id/", ownerMiddleware, async(req: Request, res: Response) => {
    const bioId = z.object({
       id: z.string()
    }).parse(req.params)
    return res.status(200).json(await getAllQrCodes(bioId.id))
})



export default router;
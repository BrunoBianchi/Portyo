import { Router, Request, Response, NextFunction } from "express";
import z from "zod"
import { createQrCode } from "../../../shared/services/qrcode.service";
const router: Router = Router();

router.post("/:id/update/:qrcodeid", async(req: Request, res: Response) => {
    const bio = z.object({
       id: z.string()
    }).parse(req.body)
    const qrcode = z.object({
        qrcodeid:z.string()
    }).parse(req.params)

})



export default router;
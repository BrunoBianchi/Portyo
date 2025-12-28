import { Router, Request, Response, NextFunction } from "express";
import z from "zod"
import { createQrCode } from "../../../shared/services/qrcode.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
const router: Router = Router();

router.post("/:id/", ownerMiddleware, async(req: Request, res: Response) => {
    const schema = z.object({
        value: z.string()
    }).parse(req.body)
    const bioschema = z.object({
        id:z.string()
    }).parse(req.params)
    return res.status(200).json(await createQrCode(bioschema.id,schema.value))
})



export default router;
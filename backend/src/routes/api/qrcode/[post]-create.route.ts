import { Router, Request, Response, NextFunction } from "express";
import z from "zod"
import { createQrCode } from "../../../shared/services/qrcode.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { requireAuth } from "../../../middlewares/auth.middleware";
const router: Router = Router();

// Create QR code - Requires Auth + Bio ownership
router.post("/:id/", requireAuth, ownerMiddleware, async(req: Request, res: Response) => {
    const schema = z.object({
        value: z.string()
    }).parse(req.body)
    const bioschema = z.object({
        id:z.string()
    }).parse(req.params)
    return res.status(200).json(await createQrCode(bioschema.id,schema.value))
})



export default router;
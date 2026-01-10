import { Router, Request, Response, NextFunction } from "express";
import z from "zod"
import { createQrCode, getAllQrCodes } from "../../../shared/services/qrcode.service";
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
import { requireAuth } from "../../../middlewares/auth.middleware";
const router: Router = Router();

// Get all QR codes for a bio - Requires Auth + Bio ownership
router.get("/:id/", requireAuth, ownerMiddleware, async(req: Request, res: Response) => {
    const bioId = z.object({
       id: z.string()
    }).parse(req.params)
    return res.status(200).json(await getAllQrCodes(bioId.id))
})



export default router;
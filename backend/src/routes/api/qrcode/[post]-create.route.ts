import { Router, Request, Response, NextFunction } from "express";
import z from "zod"
import { createQrCode, countQrCodes } from "../../../shared/services/qrcode.service";
import { PLAN_LIMITS, PlanType } from "../../../shared/constants/plan-limits";
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

    const user = req.user as any; 
    const plan = user.plan || 'free';
    
    // Check limits
    
    const limits = PLAN_LIMITS[plan as PlanType];
    const currentCount = await countQrCodes(bioschema.id);

    if(currentCount >= limits.qrcodesPerBio) {
         return res.status(403).json({
            error: "Plan limit reached",
            message: `You have reached the limit of ${limits.qrcodesPerBio} QR codes for your current plan. Please upgrade to create more.`
        });
    }

    return res.status(200).json(await createQrCode(bioschema.id,schema.value))
})



export default router;
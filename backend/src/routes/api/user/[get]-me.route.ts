import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { findUserById } from "../../../shared/services/user.service";

const router:Router = Router()

router.get("/@",authMiddleware,async (req,res)=>{
     const user = await findUserById(req.session!.user!.id as string);
     if (!user) return res.status(404).send("User not found");
     
     const payload = {
          id: user.id,
          email: user.email,
          fullname: user.fullName,
          verified: user.verified,
          provider: user.provider,
          createdAt: user.createdAt,
          plan: user.plan
      }
     res.status(200).json(payload)
})



export default router;
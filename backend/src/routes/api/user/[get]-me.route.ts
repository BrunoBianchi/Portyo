import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router:Router = Router()

router.get("/@",authMiddleware,(req,res)=>{
     res.status(200).json(req.session.user)
})



export default router;
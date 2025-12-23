import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { login } from "../../../shared/services/user.service";
import z from "zod"
const router:Router = Router()

router.post("/login",async(req,res,next)=>{
     const schema = z.object({
        email:z.string().email(),
        password:z.string()
     }).parse(req.body)
     const payload = await login(schema.password,schema.email)
     res.status(200).json(payload)

})



export default router;
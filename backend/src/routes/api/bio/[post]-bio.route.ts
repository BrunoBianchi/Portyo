import { Router } from "express";
import { createNewBio } from "../../../shared/services/bio.service";
import z from "zod"
const router:Router = Router()

router.post("/",async(req,res)=>{
     const schema = z.object({
        sufix:z.string()
     }).parse(req.body)
     return res.status(200).json(await createNewBio(schema.sufix,req.session.user!.email as string))
})



export default router;
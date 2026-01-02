import { Router } from "express";
import { getBiosFromUser } from "../../../shared/services/bio.service";
const router:Router = Router()

router.get("/",async(req,res)=>{
 
     return res.status(200).json(await getBiosFromUser(req.session!.user!.id as string, ['integrations']))
})



export default router;
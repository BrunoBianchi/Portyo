import { Router } from "express";
import { getBiosFromUser } from "../../../shared/services/bio.service";
const router:Router = Router()

router.get("/",async(req,res)=>{
 
      if(!req.user?.id) return res.status(401).json({error:"Unauthorized"})
      return res.status(200).json(await getBiosFromUser(req.user.id as string, ['integrations']))
})



export default router;
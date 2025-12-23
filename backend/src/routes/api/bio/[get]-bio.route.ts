import { Router } from "express";

const router:Router = Router()

router.get("/:id",(req,res)=>{
     res.status(200).json(req.session.user)
})



export default router;
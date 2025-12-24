import { Router } from "express";
import { createNewBio, updateBioById } from "../../../shared/services/bio.service";
import z from "zod"
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
const router:Router = Router()

router.post("/update/:id",ownerMiddleware,async(req,res)=>{
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const schema =  z.object({
        html:z.string(),
        blocks: z.array(z.any()),
        bgType: z.string().optional(),
        bgColor: z.string().optional(),
        bgSecondaryColor: z.string().optional(),
        bgImage: z.string().nullable().optional(),
        bgVideo: z.string().nullable().optional(),
        usernameColor: z.string().optional(),
        imageStyle: z.string().optional()
    }).parse(req.body)
     return res.status(200).json(await updateBioById(id, schema.html, schema.blocks, {
        bgType: schema.bgType,
        bgColor: schema.bgColor,
        bgSecondaryColor: schema.bgSecondaryColor,
        bgImage: schema.bgImage || undefined,
        bgVideo: schema.bgVideo || undefined,
        usernameColor: schema.usernameColor,
        imageStyle: schema.imageStyle
     }))
})



export default router;
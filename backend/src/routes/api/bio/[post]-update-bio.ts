import { Router } from "express";
import { createNewBio, updateBioById } from "../../../shared/services/bio.service";
import z from "zod"
import { ownerMiddleware } from "../../../middlewares/owner.middleware";
const router:Router = Router()

router.post("/update/:id",ownerMiddleware,async(req,res)=>{
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const schema =  z.object({
        html:z.string().optional(),
        blocks: z.array(z.any()).optional(),
        bgType: z.string().optional(),
        bgColor: z.string().optional(),
        bgSecondaryColor: z.string().optional(),
        bgImage: z.string().nullable().optional(),
        bgVideo: z.string().nullable().optional(),
        usernameColor: z.string().optional(),
        imageStyle: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        favicon: z.string().optional(),
        googleAnalyticsId: z.string().optional(),
        facebookPixelId: z.string().optional(),
        seoKeywords: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
        noIndex: z.boolean().optional(),
        customDomain: z.string().nullable().optional(),
        cardStyle: z.string().optional(),
        cardBackgroundColor: z.string().optional(),
        cardBorderColor: z.string().optional(),
        cardBorderWidth: z.number().optional(),
        cardBorderRadius: z.number().optional(),
        cardShadow: z.string().optional(),
        cardPadding: z.number().optional(),
        maxWidth: z.number().optional(),
        enableSubscribeButton: z.boolean().optional()
    }).parse(req.body)
     return res.status(200).json(await updateBioById(id, schema.html, schema.blocks, {
        bgType: schema.bgType,
        bgColor: schema.bgColor,
        bgSecondaryColor: schema.bgSecondaryColor,
        bgImage: schema.bgImage || undefined,
        bgVideo: schema.bgVideo || undefined,
        usernameColor: schema.usernameColor,
        imageStyle: schema.imageStyle
     }, {
        seoTitle: schema.seoTitle,
        seoDescription: schema.seoDescription,
        favicon: schema.favicon,
        googleAnalyticsId: schema.googleAnalyticsId,
        facebookPixelId: schema.facebookPixelId,
        seoKeywords: schema.seoKeywords,
        ogTitle: schema.ogTitle,
        ogDescription: schema.ogDescription,
        ogImage: schema.ogImage,
        noIndex: schema.noIndex
     }, schema.customDomain || undefined, {
        cardStyle: schema.cardStyle,
        cardBackgroundColor: schema.cardBackgroundColor,
        cardBorderColor: schema.cardBorderColor,
        cardBorderWidth: schema.cardBorderWidth,
        cardBorderRadius: schema.cardBorderRadius,
        cardShadow: schema.cardShadow,
        cardPadding: schema.cardPadding,
        maxWidth: schema.maxWidth
     }, schema.enableSubscribeButton))
})



export default router;
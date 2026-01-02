import { Request, Response, Router } from "express"
import z from "zod"
import { parseGoogleCallbackCode } from "../../../shared/services/google.service"
const router: Router = Router()

router.get("/callback", async (req: Request, res: Response) => {
    const { code } = z.object(
        { code: z.string() }
    ).parse(req.query)
    const response = await parseGoogleCallbackCode(code)
    res.redirect(`/api/google/exchange_authorization_token?token=${response.access_token}`)
})


export default router;
import { Request, Response, Router } from "express"
import { getGoogleAuthUrl } from "../../../shared/services/google.service"

const router: Router = Router()

router.get("/auth", (req: Request, res: Response) => {
    const url = getGoogleAuthUrl()
    res.redirect(url)
})

export default router;

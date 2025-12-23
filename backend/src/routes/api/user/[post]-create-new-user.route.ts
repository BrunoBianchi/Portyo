import { Router } from "express";
import z from "zod";
import { createNewUser } from "../../../shared/services/user.service";
import { createNewBio } from "../../../shared/services/bio.service";
const router: Router = Router();
router.post("/", async (req, res, next) => {

    const body = z.object({
        email: z.string().email(),
        fullname: z.string(),
        sufix: z.string(),
        password: z.string(),
    }).parse(req.body)
    const payload = {
       authentification: await createNewUser({
            email: body.email,
            fullName: body.fullname,
            password: body.password,
            provider: "password",
            verified: false,
        }),
        bio: await createNewBio(body.sufix,body.email)
    }
    res.status(200).json(payload)


});

export default router;
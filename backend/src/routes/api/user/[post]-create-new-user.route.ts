import { Router } from "express";
import z from "zod";
import { createNewUser } from "../../../shared/services/user.service";
const router: Router = Router();
router.post("/", async (req, res) => {
    try {
        const body = z.object({
            email: z.string().email(),
            fullname: z.string(),
            password: z.string(),
        }).parse(req.body)
        const token = await createNewUser({
            email: body.email,
            fullName: body.fullname,
            password: body.password
        })
        const payload = {
            fullname: body.fullname,
            email: body.email,
            token: token
        }
        res.status(200).json(payload)
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }

});

export default router;
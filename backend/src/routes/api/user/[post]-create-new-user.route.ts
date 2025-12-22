import { Router } from "express";
import z from "zod";
import { createNewUser } from "../../../shared/services/user.service";
const router: Router = Router();

router.get("/",(req,res)=>{
    res.send("eae")
})

router.post("/", async (req, res) => {
    try {
        const schema = z.object({
            email: z.email(),
            fullname: z.string(),
            password: z.string(),
            sufix: z.string().min(5)
        }).parse(req.body)
        const token = await createNewUser(schema)
        const payload = {
            fullname: schema.fullname,
            sufix: schema.sufix,
            email: schema.email,
            token: token
        }
        res.status(200).json(payload)
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }

});

export default router;
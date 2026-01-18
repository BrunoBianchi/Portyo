import { Router } from "express";
import z from "zod";
import { createNewUser } from "../../../shared/services/user.service";
import { createNewBio } from "../../../shared/services/bio.service";

const router: Router = Router();

// Password strength schema: min 8 chars, uppercase, lowercase, number
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

router.post("/", async (req, res, next) => {
    try {
        const body = z.object({
            email: z.string().email("Invalid email format"),
            fullname: z.string().min(2, "Full name is required"),
            sufix: z.string().min(1, "Username suffix is required").optional(),
            password: passwordSchema,
        }).parse(req.body);

        const authentification = await createNewUser({
            email: body.email,
            fullName: body.fullname,
            password: body.password,
            provider: "password",
            verified: false,
        });

        const payload = {
            authentification,
            bio: body.sufix ? await createNewBio(body.sufix, body.email) : null
        };
        res.status(201).json(payload);
    } catch (error) {
        next(error);
    }
});

export default router;
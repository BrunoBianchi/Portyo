import { Router } from "express";
import { login } from "../../../shared/services/user.service";
import z from "zod";
import { env } from "../../../config/env";

const router: Router = Router();

router.post("/login", async (req, res, next) => {
    try {
        const schema = z.object({
            email: z.string().email(),
            password: z.string()
        }).parse(req.body);

        const result = await login(schema.password, schema.email) as any;

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // CRITICAL: Update server-side session
        if (req.session) {
            req.session.user = result.user;
        }

        // Return access token and user (refresh token is in cookie)
        res.status(200).json({
            token: result.token,
            user: result.user
        });
    } catch (error) {
        next(error);
    }
});

export default router;
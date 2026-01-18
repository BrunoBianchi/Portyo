import { Request, Response, Router, NextFunction } from "express"
import z from "zod"
import { parseGoogleAccessToken } from "../../../shared/services/google.service"
import { logger } from "../../../shared/utils/logger"
import { env } from "../../../config/env"

const router: Router = Router()

router.get("/exchange_authorization_token", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {token} = z.object({
             token:z.string()
        }).parse(req.query)
        
        const data = await parseGoogleAccessToken(token as string)
        
        // Create session for the user
        if (req.session) {
            (req.session as any).userId = data.user.id;
            (req.session as any).email = data.user.email;
            (req.session as any).isAuthenticated = true;
        }
        
        // Build redirect URL with token - redirect to frontend
        const frontendUrl = env.FRONTEND_URL || 'https://portyo.me';
        const params = new URLSearchParams({ token: data.token });
        if (data.user && data.user.onboardingCompleted === false) {
            params.set("returnTo", "/onboarding");
        }
        const redirectUrl = `${frontendUrl}/login?${params.toString()}`;
        
        // Save session and redirect
        req.session.save((err) => {
            if (err) {
                logger.error("Failed to save session", err);
            }
            res.redirect(redirectUrl);
        });
    } catch (error: any) {
        logger.error("Google token exchange failed", error);
        
        // Redirect to frontend with error
        const frontendUrl = env.FRONTEND_URL || 'https://portyo.me';
        const errorMessage = encodeURIComponent(error.message || "Authentication failed");
        res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
    }
})


export default router;
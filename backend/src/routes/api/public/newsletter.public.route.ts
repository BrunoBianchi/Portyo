import { Router, Request, Response } from "express";
import { AppDataSource } from "../../../database/datasource";
import { UserEntity } from "../../../database/entity/user-entity";
import { verifyUnsubscribeToken } from "../../../shared/utils/unsubscribe-token";
import { logger } from "../../../shared/utils/logger";

const router: Router = Router();

/**
 * GET /api/public/newsletter/unsubscribe?token=xxx
 *
 * Stateless token-based unsubscribe — no auth required.
 * Returns a self-contained HTML confirmation page.
 */
router.get("/unsubscribe", async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
        return res.status(400).send(buildPage(
            "Invalid Link",
            "This unsubscribe link is invalid or has expired. Please try clicking the link in your email again.",
            false
        ));
    }

    const userId = verifyUnsubscribeToken(token);

    if (!userId) {
        return res.status(400).send(buildPage(
            "Invalid Link",
            "This unsubscribe link is invalid or has been tampered with.",
            false
        ));
    }

    try {
        const userRepo = AppDataSource.getRepository(UserEntity);
        const user = await userRepo.findOneBy({ id: userId });

        if (!user) {
            return res.status(404).send(buildPage(
                "User Not Found",
                "We couldn't find your account. You may have already been removed.",
                false
            ));
        }

        if (user.emailOptOut) {
            return res.status(200).send(buildPage(
                "Already Unsubscribed",
                "You've already been unsubscribed from Portyo newsletters. You won't receive any more marketing emails.",
                true
            ));
        }

        user.emailOptOut = true;
        await userRepo.save(user);

        logger.info(`📧 User ${user.email} unsubscribed from newsletter`);

        return res.status(200).send(buildPage(
            "Unsubscribed Successfully",
            "You've been unsubscribed from Portyo newsletters. You won't receive any more marketing emails from us.",
            true
        ));
    } catch (error) {
        logger.error("❌ Error processing unsubscribe:", error as any);
        return res.status(500).send(buildPage(
            "Something Went Wrong",
            "We couldn't process your request right now. Please try again later.",
            false
        ));
    }
});

/**
 * GET /api/public/newsletter/resubscribe?token=xxx
 *
 * Re-subscribe a user who previously unsubscribed.
 */
router.get("/resubscribe", async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
        return res.status(400).send(buildPage("Invalid Link", "This link is invalid.", false));
    }

    const userId = verifyUnsubscribeToken(token);
    if (!userId) {
        return res.status(400).send(buildPage("Invalid Link", "This link is invalid.", false));
    }

    try {
        const userRepo = AppDataSource.getRepository(UserEntity);
        const user = await userRepo.findOneBy({ id: userId });

        if (!user) {
            return res.status(404).send(buildPage("User Not Found", "Account not found.", false));
        }

        user.emailOptOut = false;
        await userRepo.save(user);

        logger.info(`📧 User ${user.email} re-subscribed to newsletter`);

        return res.status(200).send(buildPage(
            "Welcome Back!",
            "You've been re-subscribed to Portyo newsletters. We're glad to have you back!",
            true
        ));
    } catch (error) {
        logger.error("❌ Error processing resubscribe:", error as any);
        return res.status(500).send(buildPage(
            "Something Went Wrong",
            "We couldn't process your request right now. Please try again later.",
            false
        ));
    }
});

function buildPage(title: string, message: string, success: boolean): string {
    const iconSvg = success
        ? `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D7F000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
        : `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Portyo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f3; color: #1A1A1A; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #ffffff; border-radius: 20px; padding: 48px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 2px solid #1A1A1A; }
        .icon { margin: 0 auto 24px; }
        .logo { font-size: 20px; font-weight: 800; color: #D7F000; background-color: #1A1A1A; display: inline-block; padding: 8px 16px; border-radius: 10px; margin-bottom: 32px; letter-spacing: -0.5px; }
        h1 { font-size: 28px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
        p { font-size: 16px; color: #6b7280; line-height: 1.6; margin-bottom: 32px; }
        .btn { display: inline-block; padding: 14px 32px; background-color: #1A1A1A; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.2s; }
        .btn:hover { background-color: #D7F000; color: #1A1A1A; }
        .footer-text { margin-top: 32px; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">Portyo*</div>
        <div class="icon">${iconSvg}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="https://portyo.me" class="btn">Go to Portyo</a>
        <p class="footer-text">&copy; ${new Date().getFullYear()} Portyo. All rights reserved.</p>
    </div>
</body>
</html>`;
}

export default router;

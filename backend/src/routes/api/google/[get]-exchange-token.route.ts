import { Request, Response, Router, NextFunction } from "express"
import z from "zod"
import { parseGoogleAccessToken } from "../../../shared/services/google.service"
import { logger } from "../../../shared/utils/logger"

const router: Router = Router()

router.get("/exchange_authorization_token", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {token} = z.object({
             token:z.string()
        }).parse(req.query)
        
        const data = await parseGoogleAccessToken(token as string)
        
        // Build redirect URL with token - redirect to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'https://portyo.me';
        const redirectUrl = `${frontendUrl}/login?oauth=success&token=${encodeURIComponent(data.token)}`;
        
        // Safely escape JSON for inline script
        const jsonData = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
        
        const html = `
        <html>
            <body>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                    <h3>Authentication successful</h3>
                    <p>Redirecting...</p>
                </div>
                <script>
                    (function() {
                        var data = ${jsonData};
                        var redirectUrl = "${redirectUrl}";
                        var messageSent = false;
                        
                        try {
                            // Try postMessage first (if popup opened from same origin)
                            if (window.opener && !window.opener.closed) {
                                window.opener.postMessage(data, "*");
                                messageSent = true;
                                console.log("Message sent to opener");
                                
                                // Try to close
                                setTimeout(function() {
                                    try { window.close(); } catch(e) {}
                                }, 300);
                                
                                // Fallback: if window doesn't close after 1s, redirect
                                setTimeout(function() {
                                    window.location.href = redirectUrl;
                                }, 1000);
                            } else {
                                // No opener - redirect immediately
                                window.location.href = redirectUrl;
                            }
                        } catch (e) {
                            console.error("Error during OAuth callback:", e);
                            window.location.href = redirectUrl;
                        }
                    })();
                </script>
            </body>
        </html>
        `;
        res.send(html)
    } catch (error: any) {
        logger.error("Google token exchange failed", error);
        
        // Send error back to opener
        const errorData = {
            error: error.message || "Authentication failed"
        };

        const html = `
        <html>
            <body>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: red;">
                    <h3>Authentication Failed</h3>
                    <p>${error.message || "Unknown error"}</p>
                </div>
                <script>
                    try {
                        if (window.opener) {
                            window.opener.postMessage(${JSON.stringify(errorData)}, "*");
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    // Keep window open so user sees error
                </script>
            </body>
        </html>
        `;
        res.send(html);
    }
})


export default router;
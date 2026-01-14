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
        
        // Safely escape JSON for inline script to prevent XSS and parse errors
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
                        var messageSent = false;
                        
                        try {
                            if (window.opener && !window.opener.closed) {
                                window.opener.postMessage(data, "*");
                                messageSent = true;
                                console.log("Message sent to opener");
                            } else {
                                console.warn("No window.opener found or it was closed.");
                            }
                        } catch (e) {
                            console.error("Failed to post message to opener", e);
                        }
                        
                        // Try to close the popup
                        function tryClose() {
                            try {
                                window.close();
                            } catch (e) {
                                console.warn("Could not close window");
                            }
                        }
                        
                        if (messageSent) {
                            // Give time for message to be processed then close
                            setTimeout(tryClose, 500);
                        } else {
                            // If we couldn't send message, redirect to main site after a delay
                            setTimeout(function() {
                                window.location.href = "https://portyo.me/login?oauth=success&token=" + encodeURIComponent(data.token);
                            }, 1500);
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
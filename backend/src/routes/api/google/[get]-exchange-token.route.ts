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
        
        const html = `
        <html>
            <body>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                    <h3>Authentication successful</h3>
                    <p>You can close this window now.</p>
                </div>
                <script>
                    try {
                        if (window.opener) {
                            window.opener.postMessage(${JSON.stringify(data)}, "*");
                        } else {
                            console.warn("No window.opener found. This popup might have been opened separately.");
                        }
                    } catch (e) {
                         console.error("Failed to post message to opener", e);
                    }
                    setTimeout(() => window.close(), 1000);
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
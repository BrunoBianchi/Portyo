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
                <script>
                    window.opener.postMessage(${JSON.stringify(data)}, "*");
                    window.close();
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
                <script>
                    window.opener.postMessage(${JSON.stringify(errorData)}, "*");
                    window.close();
                </script>
            </body>
        </html>
        `;
        res.send(html);
    }
})


export default router;
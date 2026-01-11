import { Router } from "express";
import { getEmailUsage } from "../../../shared/services/email-limit.service";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

/**
 * GET /api/user/email-usage
 * Get current email usage for the authenticated user
 */
router.get("/email-usage", authMiddleware, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const userId = req.user.id;
        const usage = await getEmailUsage(userId);
        
        return res.status(200).json(usage);
    } catch (error: any) {
        return res.status(error.code || 500).json({
            error: error.message || "Failed to fetch email usage"
        });
    }
});

export default router;

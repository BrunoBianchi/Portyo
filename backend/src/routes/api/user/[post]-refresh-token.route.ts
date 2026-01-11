import { Router } from "express";
import { verifyRefreshToken, generateToken } from "../../../shared/services/jwt.service";
import { findUserById } from "../../../shared/services/user.service";
import { BillingService } from "../../../services/billing.service";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";

const router: Router = Router();

/**
 * POST /user/refresh-token
 * Exchange a valid refresh token (from HttpOnly cookie) for a new access token
 */
router.post("/refresh-token", async (req, res, next) => {
    try {
        // Get refresh token from HttpOnly cookie
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new ApiError(APIErrors.unauthorizedError, "No refresh token provided", 401);
        }

        // Verify the refresh token and extract user ID
        const userId = await verifyRefreshToken(refreshToken);

        // Get fresh user data
        const user = await findUserById(userId);
        if (!user) {
            throw new ApiError(APIErrors.unauthorizedError, "User not found", 401);
        }

        // Get active plan
        const activePlan = await BillingService.getActivePlan(userId);

        // Generate new access token with fresh user data
        const payload = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            verified: user.verified,
            provider: user.provider,
            createdAt: user.createdAt,
            plan: activePlan
        };

        const accessToken = await generateToken(payload);

        res.status(200).json({
            token: accessToken,
            user: payload
        });
    } catch (error) {
        next(error);
    }
});

export default router;

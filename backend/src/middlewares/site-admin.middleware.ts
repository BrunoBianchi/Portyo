import { NextFunction, Request, Response } from "express";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { logger } from "../shared/utils/logger";

export const requireSiteAdmin = (req: Request, res: Response, next: NextFunction) => {
    // 1. Ensure user is authenticated (should be called after requireAuth usually, but we check here too)
    if (!req.user || !req.user.email) {
        throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }
    
    // 2. Check strict email allowlist
    if (req.user.email !== "bruno2002.raiado@gmail.com") {
        logger.warn(`Unauthorized access attempt to Site Admin by ${req.user.email}`);
        throw new ApiError(APIErrors.unauthorizedError, "Access Denied: Admin only", 403);
    }

    next();
};

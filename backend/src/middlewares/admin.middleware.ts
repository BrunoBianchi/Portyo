import { Request, Response, NextFunction } from "express";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { logger } from "../shared/utils/logger";

const ADMIN_EMAIL = 'bruno2002.raiado@gmail.com';

/**
 * Middleware that requires the current user to be an admin.
 * Only users with the admin email can access protected routes.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        logger.debug('Admin access denied: Not authenticated');
        throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    if (req.user.email !== ADMIN_EMAIL) {
        logger.warn(`Admin access denied for user: ${req.user.email}`);
        throw new ApiError(APIErrors.forbiddenError, "Admin access required", 403);
    }

    logger.debug(`Admin access granted for: ${req.user.email}`);
    next();
};

/**
 * Check if a user is an admin (without throwing)
 */
export const isAdmin = (email?: string): boolean => {
    return email === ADMIN_EMAIL;
};

export { ADMIN_EMAIL };

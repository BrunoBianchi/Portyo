import { NextFunction, Request, Response } from "express";
import { UserType } from "../shared/types/user.type";
import { decryptToken } from "../shared/services/jwt.service";
import { logger } from "../shared/utils/logger";
import { ApiError, APIErrors } from "../shared/errors/api-error";

declare module "express-session" {
    interface SessionData {
        user: Partial<UserType>;
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: Partial<UserType>;
        }
    }
}

export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check Session first (for server-side rendered apps with cookies)
    if (req.session && req.session.user) {
        req.user = req.session.user;
        logger.debug('User authenticated via SESSION', { userId: req.user.id });
        return next();
    }

    // 2. Check JWT Header (for API requests and mobile apps)
    const { authorization } = req.headers;
    const token = authorization?.split("Bearer ")[1]?.trim();

    if (token) {
        logger.debug('Attempting JWT authentication', { tokenPreview: token.substring(0, 20) + '...' });
        try {
            const user = await decryptToken(token) as UserType;
            if (user) {
                const payload: Partial<UserType> = {
                    fullName: user.fullName,
                    email: user.email,
                    id: user.id,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    plan: user.plan,
                    verified: user.verified
                };
                req.user = payload;
                // Sync to session for subsequent requests
                req.session.user = payload;
                logger.debug('User authenticated via JWT', { userId: req.user.id });
            }
        } catch (error: any) {
            // Log JWT verification failures for debugging
            if (error instanceof ApiError) {
                logger.debug(`JWT verification failed: ${error.message}`);
            } else {
                logger.warn('Unexpected error during JWT verification', { error: error.message });
            }
            // Don't set req.user, continue without authentication
            // The requireAuth middleware will handle the rejection
        }
    } else {
        logger.debug('No authentication found (no session or JWT token)');
    }
    next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        logger.debug('Authentication required but user not authenticated');
        throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401)
    }
    logger.debug('Authentication check passed', { userId: req.user.id });
    next();
};

// Alias for backward compatibility if needed, but better to use requireAuth
export const authMiddleware = requireAuth;

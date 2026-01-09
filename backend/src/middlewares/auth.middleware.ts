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
    // 1. Check Session
    if (req.session && req.session.user) {
        req.user = req.session.user;
        return next();
    }

    // 2. Check Header
    const { authorization } = req.headers;
    const token = authorization?.split("Bearer ")[1]?.trim();

    if (token) {
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
                // Sync to session
                req.session.user = payload;
            }
        } catch (error) {
            logger.debug("Invalid token provided in authorization header");
        }
    }
    next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401)
    }
    next();
};

// Alias for backward compatibility if needed, but better to use requireAuth
export const authMiddleware = requireAuth;

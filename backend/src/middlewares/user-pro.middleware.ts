import { NextFunction, Request, Response } from "express";
import { ApiError, APIErrors } from "../shared/errors/api-error";

/**
 * Middleware that checks if the current user has a PRO plan.
 * Requires authentication middleware to run first.
 */
export const isUserPro = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
    }

    if (req.user.plan !== "pro") {
        throw new ApiError(
            APIErrors.paymentRequiredError,
            "This feature requires a PRO subscription",
            402
        );
    }

    next();
};
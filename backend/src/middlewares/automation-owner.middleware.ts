import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { getAutomationById } from "../shared/services/automation.service";

/**
 * Middleware that verifies the current user owns the specified automation.
 * Checks that the bio associated with the automation belongs to the user.
 * Requires authentication middleware to run first.
 * @throws 401 if user is not authenticated
 * @throws 404 if automation is not found
 * @throws 403 if user does not own the automation
 */
export const requireAutomationOwner = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { automationId } = z.object({ automationId: z.string().uuid() }).parse(req.params);
        
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
        }

        const automation = await getAutomationById(automationId);
        if (!automation) {
            throw new ApiError(APIErrors.notFoundError, "Automation not found", 404);
        }

        // Check if the bio associated with the automation belongs to the user
        if (automation.bio.userId !== userId) {
            throw new ApiError(
                APIErrors.authorizationError,
                "You are not authorized to access this automation",
                403
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

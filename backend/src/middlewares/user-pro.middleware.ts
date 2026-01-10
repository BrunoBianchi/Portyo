import { NextFunction, Request, Response } from "express";
import { ApiError, APIErrors } from "../shared/errors/api-error";
import { BillingService } from "../services/billing.service";


/**
 * Middleware that checks if the current user has a PRO plan.
 * Requires authentication middleware to run first.
 * @throws 401 if user is not authenticated
 * @throws 402 if user plan is not PRO
 */
export const isUserPro = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
        }

        const activePlan = await BillingService.getActivePlan(req.user.id);
        
        // Debug log
        console.log(`[isUserPro] User: ${req.user.id}, Computed Plan: "${activePlan}"`);

        // Update req.user.plan so subsequent handlers have the fresh value
        req.user.plan = activePlan;

        if (activePlan !== "pro") {
            throw new ApiError(
                APIErrors.paymentRequiredError,
                "This feature requires a PRO subscription. Upgrade to unlock.",
                402
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware that checks if the current user has a paid plan (Standard or PRO).
 * Useful for features that require any paid subscription.
 * Requires authentication middleware to run first.
 * @throws 401 if user is not authenticated
 * @throws 402 if user plan is free
 */
export const requirePaidPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);
        }

        const activePlan = await BillingService.getActivePlan(req.user.id);
        
        // Debug log
        console.log(`[requirePaidPlan] User: ${req.user.id}, Computed Plan: "${activePlan}"`);

        // Update req.user.plan so subsequent handlers have the fresh value
        req.user.plan = activePlan;

        if (activePlan === "free") {
            throw new ApiError(
                APIErrors.paymentRequiredError,
                "This feature requires a paid subscription (Standard or PRO).",
                402
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};
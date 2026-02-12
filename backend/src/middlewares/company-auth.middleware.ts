import { NextFunction, Request, Response } from "express";
import { verifyCompanyToken } from "../shared/services/company-auth.service";
import { ApiError, APIErrors } from "../shared/errors/api-error";

declare global {
    namespace Express {
        interface Request {
            company?: {
                companyId: string;
                email: string;
                companyName: string;
            };
        }
    }
}

export const companyAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        const token = authorization?.split("Bearer ")[1]?.trim();

        if (!token) {
            throw new ApiError(APIErrors.unauthorizedError, "Company authentication required", 401);
        }

        const payload = await verifyCompanyToken(token);
        req.company = payload;
        next();
    } catch (error: any) {
        if (error instanceof ApiError) {
            return res.status(error.code).json({ error: error.message });
        }
        return res.status(401).json({ error: "Invalid company token" });
    }
};

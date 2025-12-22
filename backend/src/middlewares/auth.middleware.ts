import { NextFunction, Request, Response } from "express";
import { UserType } from "../shared/types/user.type";
import { decryptToken } from "../shared/services/jwt.service";
declare module "express-session" {
    interface SessionData {
        user: UserType;
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        return next();
    }
    const { authorization } = req.headers;
    const token = authorization?.split("Bearer ")[1]?.trim();

    if (!token) {
        res.status(401).send("Not Authenticated!");
        return;
    }

    const user = await decryptToken(token) as UserType;
    const payload = {
        fullname: user.fullName,
        email: user.email,
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
    if (!user) {
        res.status(401).send("Not Authenticated!");
        return;
    } else {
        (req.session as any).user = payload as Partial<UserType>;
        next();
    }
}
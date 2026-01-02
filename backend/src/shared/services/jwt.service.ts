import * as jose from 'jose';
import { UserType } from '../types/user.type';
import { env } from '../../config/env';
import { ApiError, APIErrors } from '../errors/api-error';
import { logger } from '../utils/logger';

export const generateToken = async (payload: object): Promise<string> => {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new jose.SignJWT(payload as jose.JWTPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
    return token;
}

export const decryptToken = async (token: string): Promise<Partial<UserType> | Error | null> => {
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        
        // Validate secret length (HS256 requires at least 32 bytes for security best practices, though jose might accept less)
        if (secret.length < 32 && env.NODE_ENV === 'production') {
            logger.warn("JWT_SECRET is too short for HS256. It should be at least 32 characters long.");
        }

        const { payload } = await jose.jwtVerify(token, secret, {
            algorithms: ['HS256'] // Enforce algorithm
        });
        
        return payload as Partial<UserType>
    } catch (err: any) {
        if (err.code === 'ERR_JWT_EXPIRED') {
             throw new ApiError(APIErrors.unauthorizedError, "Token expired", 401);
        }
        if (err.code === 'ERR_JWS_INVALID') {
             throw new ApiError(APIErrors.unauthorizedError, "Invalid token signature", 401);
        }
        throw new ApiError(APIErrors.unauthorizedError, "Invalid token", 401);
    }
}
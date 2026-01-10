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
        .setIssuer('portyo-backend')
        .setExpirationTime('7d')
        .sign(secret);
    return token;
}

export const decryptToken = async (token: string): Promise<Partial<UserType>> => {
    // Validate token format
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
        logger.debug('Invalid token format: empty or invalid type');
        throw new ApiError(APIErrors.unauthorizedError, "Invalid token format", 401);
    }

    // Check if token has the expected JWT structure (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
        logger.debug(`Invalid JWT structure: expected 3 parts, got ${parts.length}`);
        throw new ApiError(APIErrors.unauthorizedError, "Malformed token", 401);
    }

    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        
        // Verify token with strict validation
        const { payload } = await jose.jwtVerify(token, secret, {
            algorithms: ['HS256'], // Only accept HS256
            issuer: 'portyo-backend', // Verify issuer
            clockTolerance: 10 // Allow 10 seconds clock skew
        });

        // Additional validation: check if payload has required fields
        if (!payload || typeof payload !== 'object') {
            logger.warn('JWT payload is invalid or empty');
            throw new ApiError(APIErrors.unauthorizedError, "Invalid token payload", 401);
        }

        logger.debug('JWT verified successfully', { userId: (payload as any).id });
        return payload as Partial<UserType>;
        
    } catch (err: any) {
        // Log the actual error for debugging (but don't expose to client)
        logger.debug('JWT verification failed', { 
            error: err.message, 
            code: err.code,
            tokenPreview: token.substring(0, 20) + '...'
        });

        // Handle specific JWT errors
        if (err.code === 'ERR_JWT_EXPIRED') {
            throw new ApiError(APIErrors.unauthorizedError, "Token expired", 401);
        }
        
        if (err.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
            throw new ApiError(APIErrors.unauthorizedError, "Invalid token signature - token may have been tampered with", 401);
        }

        if (err.code === 'ERR_JWS_INVALID') {
            throw new ApiError(APIErrors.unauthorizedError, "Invalid token signature", 401);
        }

        if (err.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
            throw new ApiError(APIErrors.unauthorizedError, "Token validation failed", 401);
        }

        // If it's already an ApiError, rethrow it
        if (err instanceof ApiError) {
            throw err;
        }

        // Generic error for unknown issues
        throw new ApiError(APIErrors.unauthorizedError, "Invalid or corrupted token", 401);
    }
}
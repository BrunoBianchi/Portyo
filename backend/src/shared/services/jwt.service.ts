import * as jose from 'jose';
import { UserType } from '../types/user.type';
import { ApiError, APIErrors } from '../errors/api-error';

export const generateToken = async (payload: object): Promise<string> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const token = await new jose.SignJWT(payload as jose.JWTPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
    return token;
}

export const decryptToken = async (token: string): Promise<Partial<UserType> | Error | null> => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
        const { payload } = await jose.jwtVerify(token, secret);
        return payload as Partial<UserType>
    } catch (err: any) {
        throw new ApiError(APIErrors.unauthorizedError, "Invalid or expired token", 401);
    }

}
import * as jose from 'jose';
export const generateToken = async (payload: object): Promise<string> => { 
    console.log(process.env.JWT_SECRET )
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');
    const token = await new jose.SignJWT(payload as jose.JWTPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
    return token;
}
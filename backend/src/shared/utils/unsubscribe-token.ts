import { createHmac } from "crypto";
import { env } from "../../config/env";

const HMAC_ALGO = "sha256";

/**
 * Generate a stateless unsubscribe token for a user.
 * Token = base64url(userId + "." + hmac(userId))
 */
export function generateUnsubscribeToken(userId: string): string {
    const signature = createHmac(HMAC_ALGO, env.JWT_SECRET)
        .update(userId)
        .digest("base64url");
    const payload = Buffer.from(`${userId}.${signature}`).toString("base64url");
    return payload;
}

/**
 * Verify an unsubscribe token and return the userId if valid.
 * Returns null if the token is invalid or tampered with.
 */
export function verifyUnsubscribeToken(token: string): string | null {
    try {
        const decoded = Buffer.from(token, "base64url").toString("utf8");
        const dotIndex = decoded.indexOf(".");
        if (dotIndex === -1) return null;

        const userId = decoded.substring(0, dotIndex);
        const signature = decoded.substring(dotIndex + 1);

        const expectedSignature = createHmac(HMAC_ALGO, env.JWT_SECRET)
            .update(userId)
            .digest("base64url");

        if (signature !== expectedSignature) return null;

        return userId;
    } catch {
        return null;
    }
}

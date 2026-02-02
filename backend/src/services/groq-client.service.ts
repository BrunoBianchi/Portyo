import Groq from "groq-sdk";
import { env } from "../config/env";
import { logger } from "../shared/utils/logger";

// Collection of all available API keys
const getApiKeys = (): string[] => {
    const keys: string[] = [];
    if (env.GROQ_API_KEY) keys.push(env.GROQ_API_KEY);
    if (env.GROQ_API_KEY_1) keys.push(env.GROQ_API_KEY_1);
    if (env.GROQ_API_KEY_2) keys.push(env.GROQ_API_KEY_2);
    return keys;
};

interface GroqClientConfig {
    apiKey: string;
    isRateLimited: boolean;
    rateLimitResetAt: Date | null;
    consecutiveErrors: number;
}

class GroqClientManager {
    private clients: GroqClientConfig[];
    private currentIndex: number = 0;
    private readonly maxConsecutiveErrors = 3;
    private readonly rateLimitCooldownMs = 60 * 1000; // 1 minute cooldown

    constructor() {
        const keys = getApiKeys();
        if (keys.length === 0) {
            logger.error("[GroqClient] No API keys configured!");
            throw new Error("No Groq API keys configured");
        }

        this.clients = keys.map((key) => ({
            apiKey: key,
            isRateLimited: false,
            rateLimitResetAt: null,
            consecutiveErrors: 0,
        }));

        logger.info(`[GroqClient] Initialized with ${this.clients.length} API key(s)`);
    }

    private getGroqClient(apiKey: string): Groq {
        return new Groq({ apiKey });
    }

    private getAvailableClientIndex(): number {
        const now = new Date();

        // Try to find a client that is not rate limited
        for (let i = 0; i < this.clients.length; i++) {
            const idx = (this.currentIndex + i) % this.clients.length;
            const client = this.clients[idx];

            // Check if rate limit has expired
            if (client.isRateLimited && client.rateLimitResetAt) {
                if (now >= client.rateLimitResetAt) {
                    logger.info(`[GroqClient] Rate limit expired for key ${idx + 1}`);
                    client.isRateLimited = false;
                    client.rateLimitResetAt = null;
                    client.consecutiveErrors = 0;
                }
            }

            if (!client.isRateLimited && client.consecutiveErrors < this.maxConsecutiveErrors) {
                return idx;
            }
        }

        // All clients are rate limited, reset the first one and use it
        logger.warn("[GroqClient] All API keys are rate limited, resetting first key");
        this.clients[0].isRateLimited = false;
        this.clients[0].rateLimitResetAt = null;
        this.clients[0].consecutiveErrors = 0;
        return 0;
    }

    private markRateLimited(index: number): void {
        const client = this.clients[index];
        client.isRateLimited = true;
        client.rateLimitResetAt = new Date(Date.now() + this.rateLimitCooldownMs);
        client.consecutiveErrors++;
        logger.warn(`[GroqClient] Key ${index + 1} marked as rate limited until ${client.rateLimitResetAt.toISOString()}`);
    }

    private markError(index: number): void {
        this.clients[index].consecutiveErrors++;
        logger.warn(`[GroqClient] Key ${index + 1} consecutive errors: ${this.clients[index].consecutiveErrors}`);
    }

    private markSuccess(index: number): void {
        this.clients[index].consecutiveErrors = 0;
    }

    async createChatCompletion(
        params: Parameters<Groq["chat"]["completions"]["create"]>[0],
        maxRetries: number = 3
    ): Promise<ReturnType<Groq["chat"]["completions"]["create"]>> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const clientIndex = this.getAvailableClientIndex();
            const clientConfig = this.clients[clientIndex];

            try {
                const groq = this.getGroqClient(clientConfig.apiKey);
                logger.debug(`[GroqClient] Using key ${clientIndex + 1}/${this.clients.length}`);

                const result = await groq.chat.completions.create(params);

                this.markSuccess(clientIndex);
                this.currentIndex = clientIndex; // Keep using this key for now

                return result;
            } catch (error: any) {
                lastError = error;

                // Check if it's a rate limit error
                if (error?.status === 429 || error?.code === "rate_limit_exceeded") {
                    logger.warn(`[GroqClient] Rate limit hit on key ${clientIndex + 1}`);
                    this.markRateLimited(clientIndex);
                    // Move to next key immediately
                    this.currentIndex = (clientIndex + 1) % this.clients.length;
                    continue;
                }

                // Check for other retryable errors
                if (error?.status === 500 || error?.status === 503 || error?.code === "temporarily_unavailable") {
                    logger.warn(`[GroqClient] Server error on key ${clientIndex + 1}, will retry`);
                    this.markError(clientIndex);
                    await this.delay(1000 * (attempt + 1)); // Exponential backoff
                    continue;
                }

                // Non-retryable error
                logger.error(`[GroqClient] Non-retryable error: ${error?.message}`);
                throw error;
            }
        }

        logger.error(`[GroqClient] All retries exhausted`);
        throw lastError || new Error("All API keys failed");
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getStats(): { totalKeys: number; availableKeys: number; rateLimitedKeys: number } {
        const now = new Date();
        let available = 0;
        let rateLimited = 0;

        for (const client of this.clients) {
            if (client.isRateLimited && client.rateLimitResetAt && now < client.rateLimitResetAt) {
                rateLimited++;
            } else {
                available++;
            }
        }

        return {
            totalKeys: this.clients.length,
            availableKeys: available,
            rateLimitedKeys: rateLimited,
        };
    }
}

// Singleton instance
let groqManager: GroqClientManager | null = null;

export const getGroqClient = (): GroqClientManager => {
    if (!groqManager) {
        groqManager = new GroqClientManager();
    }
    return groqManager;
};

// Helper function for direct usage
export const groqChatCompletion = async (
    params: Parameters<Groq["chat"]["completions"]["create"]>[0]
): Promise<ReturnType<Groq["chat"]["completions"]["create"]>> => {
    const client = getGroqClient();
    return client.createChatCompletion(params);
};

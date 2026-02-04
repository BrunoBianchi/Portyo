/**
 * Z.AI Client Service (GLM 4.7)
 * Primary AI service with parallel processing via Redis queues
 * Falls back to Groq when Z.AI is busy
 */

import OpenAI from "openai";
import { env } from "../config/env";
import { logger } from "../shared/utils/logger";
import redisClient from "../config/redis.client";
import { groqChatCompletion } from "./groq-client.service";

// Z.AI uses OpenAI-compatible API
const ZAI_BASE_URL = env.Z_AI_BASE_URL || "https://api.z.ai/v1";
const ZAI_MODEL = env.Z_AI_MODEL || "glm-4.7";

// Queue configuration
const ZAI_QUEUE_KEY = "zai:queue";
const ZAI_PROCESSING_KEY = "zai:processing";
const ZAI_QUEUE_BATCH_SIZE = 10;
const ZAI_QUEUE_DELAY_MS = 500; // 500ms between requests
const ZAI_BUSY_THRESHOLD = 20; // If queue > 20, consider busy
const ZAI_REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout
const ZAI_MAX_RETRIES = 2;

export type ZAIResponseFormat = { type: "json_object" } | { type: "text" };

interface ZAIRequest {
    id: string;
    messages: any[];
    model: string;
    temperature: number;
    max_tokens: number;
    response_format?: ZAIResponseFormat;
    timeout: number;
    priority: number; // 1-10, higher = more priority
    retryCount: number;
}

export interface ZAIResponse {
    id: string;
    content: string;
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    success: boolean;
    error?: string;
    provider: "zai" | "groq" | "cache";
    processingTimeMs: number;
    retryCount?: number;
}

class ZAIClientManager {
    private client: OpenAI;
    private isInitialized: boolean = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private isProcessing: boolean = false;

    constructor() {
        if (!env.Z_AI_API_KEY) {
            logger.warn("[ZAI] No API key configured, will use Groq fallback");
            this.client = null as any;
            return;
        }

        this.client = new OpenAI({
            apiKey: env.Z_AI_API_KEY,
            baseURL: ZAI_BASE_URL,
            timeout: ZAI_REQUEST_TIMEOUT_MS,
        });

        this.isInitialized = true;
        logger.info("[ZAI] Client initialized with GLM 4.7");
        
        // Start queue processor
        this.startQueueProcessor();
    }

    /**
     * Check if Z.AI is available and configured
     */
    isAvailable(): boolean {
        return this.isInitialized && !!env.Z_AI_API_KEY;
    }

    /**
     * Check if Z.AI queue is busy
     */
    async isQueueBusy(): Promise<boolean> {
        try {
            const queueLength = await redisClient.zcard(ZAI_QUEUE_KEY);
            const processingLength = await redisClient.scard(ZAI_PROCESSING_KEY);
            const totalPending = queueLength + processingLength;
            
            logger.debug(`[ZAI] Queue status: ${queueLength} queued, ${processingLength} processing`);
            
            return totalPending > ZAI_BUSY_THRESHOLD;
        } catch (error) {
            logger.error("[ZAI] Error checking queue status:", error);
            return true; // Assume busy on error
        }
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(): Promise<{
        queued: number;
        processing: number;
        total: number;
        isBusy: boolean;
    }> {
        try {
            const queued = await redisClient.zcard(ZAI_QUEUE_KEY);
            const processing = await redisClient.scard(ZAI_PROCESSING_KEY);
            
            return {
                queued,
                processing,
                total: queued + processing,
                isBusy: (queued + processing) > ZAI_BUSY_THRESHOLD,
            };
        } catch (error) {
            logger.error("[ZAI] Error getting queue stats:", error);
            return { queued: 0, processing: 0, total: 0, isBusy: true };
        }
    }

    /**
     * Create chat completion - Smart routing between Z.AI and Groq
     */
    async createChatCompletion(
        params: {
            messages: any[];
            model?: string;
            temperature?: number;
            max_tokens?: number;
            response_format?: ZAIResponseFormat;
            priority?: number; // 1-10, default 5
        },
        maxRetries: number = ZAI_MAX_RETRIES
    ): Promise<ZAIResponse> {
        const startTime = Date.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if Z.AI is available
        if (!this.isAvailable()) {
            logger.info("[ZAI] Not available, using Groq fallback directly");
            return this.fallbackToGroq(params, requestId, startTime);
        }

        // Check queue status
        const isBusy = await this.isQueueBusy();
        
        if (isBusy) {
            logger.info(`[ZAI] Queue busy, using Groq for ${requestId}`);
            return this.fallbackToGroq(params, requestId, startTime);
        }

        try {
            // Try Z.AI directly first (fast path)
            const result = await this.callZAI({
                id: requestId,
                messages: params.messages,
                model: params.model || ZAI_MODEL,
                temperature: params.temperature ?? 0.7,
                max_tokens: params.max_tokens ?? 2000,
                response_format: params.response_format,
                timeout: ZAI_REQUEST_TIMEOUT_MS,
                priority: params.priority ?? 5,
                retryCount: 0,
            });

            if (result.success) {
                return result;
            }

            // If Z.AI failed, queue it or fallback
            if ((result.retryCount ?? 0) < maxRetries) {
                logger.warn(`[ZAI] Direct call failed for ${requestId}, queueing...`);
                return this.enqueueAndWait(params, requestId, startTime, maxRetries);
            }

            // Max retries reached, fallback to Groq
            return this.fallbackToGroq(params, requestId, startTime);

        } catch (error: any) {
            logger.error(`[ZAI] Error in createChatCompletion for ${requestId}:`, error.message);
            
            if (error.message?.includes("timeout") || error.message?.includes("rate limit")) {
                // Queue for later processing
                return this.enqueueAndWait(params, requestId, startTime, maxRetries);
            }

            // Other errors, fallback immediately
            return this.fallbackToGroq(params, requestId, startTime);
        }
    }

    /**
     * Direct Z.AI API call
     */
    private async callZAI(request: ZAIRequest): Promise<ZAIResponse> {
        const startTime = Date.now();
        
        try {
            // Add to processing set
            await redisClient.sadd(ZAI_PROCESSING_KEY, request.id);

            const completion = await this.client.chat.completions.create({
                model: request.model,
                messages: request.messages,
                temperature: request.temperature,
                max_tokens: request.max_tokens,
                response_format: request.response_format,
            });

            // Remove from processing set
            await redisClient.srem(ZAI_PROCESSING_KEY, request.id);

            const content = completion.choices[0]?.message?.content || "";
            
            return {
                id: request.id,
                content,
                model: completion.model,
                usage: completion.usage as any,
                success: true,
                provider: "zai",
                processingTimeMs: Date.now() - startTime,
            };

        } catch (error: any) {
            // Remove from processing set
            await redisClient.srem(ZAI_PROCESSING_KEY, request.id);

            logger.error(`[ZAI] API call failed for ${request.id}:`, error.message);
            
            return {
                id: request.id,
                content: "",
                model: request.model,
                success: false,
                error: error.message,
                provider: "zai",
                processingTimeMs: Date.now() - startTime,
                retryCount: request.retryCount + 1,
            } as ZAIResponse;
        }
    }

    /**
     * Enqueue request and wait for processing
     */
    private async enqueueAndWait(
        params: any,
        requestId: string,
        startTime: number,
        maxRetries: number
    ): Promise<ZAIResponse> {
        // Create request object
        const request: ZAIRequest = {
            id: requestId,
            messages: params.messages,
            model: params.model || ZAI_MODEL,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.max_tokens ?? 2000,
            response_format: params.response_format,
            timeout: ZAI_REQUEST_TIMEOUT_MS,
            priority: params.priority ?? 5,
            retryCount: 0,
        };

        // Calculate score (priority + timestamp for FIFO within same priority)
        const score = Date.now() + (10 - request.priority) * 1000;

        // Add to queue
        await redisClient.zadd(ZAI_QUEUE_KEY, score, JSON.stringify(request));
        
        logger.info(`[ZAI] Request ${requestId} enqueued with priority ${request.priority}`);

        // Set result key with expiration
        const resultKey = `zai:result:${requestId}`;
        await redisClient.setex(resultKey, 300, "PENDING"); // 5 min timeout

        // Wait for result (polling)
        const maxWaitTime = 120000; // 2 minutes max wait
        const pollInterval = 500; // 500ms
        const startWait = Date.now();

        while (Date.now() - startWait < maxWaitTime) {
            await this.delay(pollInterval);
            
            const result = await redisClient.get(resultKey);
            
            if (result && result !== "PENDING") {
                // Parse result
                try {
                    const parsedResult: ZAIResponse = JSON.parse(result);
                    await redisClient.del(resultKey);
                    
                    // Add total processing time
                    parsedResult.processingTimeMs = Date.now() - startTime;
                    
                    return parsedResult;
                } catch (e) {
                    logger.error(`[ZAI] Failed to parse result for ${requestId}`);
                    break;
                }
            }
        }

        // Timeout - fallback to Groq
        logger.warn(`[ZAI] Queue timeout for ${requestId}, falling back to Groq`);
        await redisClient.zrem(ZAI_QUEUE_KEY, JSON.stringify(request));
        await redisClient.del(resultKey);
        
        return this.fallbackToGroq(params, requestId, startTime);
    }

    /**
     * Fallback to Groq
     */
    private async fallbackToGroq(
        params: any,
        requestId: string,
        startTime: number
    ): Promise<ZAIResponse> {
        logger.info(`[ZAI] Falling back to Groq for ${requestId}`);
        
        try {
            const groqResult = await groqChatCompletion({
                messages: params.messages,
                model: env.GROQ_MODEL,
                temperature: params.temperature ?? 0.7,
                max_tokens: params.max_tokens ?? 2000,
                response_format: params.response_format,
            });

            const content = (groqResult as any).choices[0]?.message?.content || "";
            
            return {
                id: requestId,
                content,
                model: env.GROQ_MODEL,
                usage: (groqResult as any).usage,
                success: true,
                provider: "groq",
                processingTimeMs: Date.now() - startTime,
            };

        } catch (error: any) {
            logger.error(`[ZAI] Groq fallback failed for ${requestId}:`, error.message);
            
            return {
                id: requestId,
                content: "",
                model: env.GROQ_MODEL,
                success: false,
                error: error.message,
                provider: "groq",
                processingTimeMs: Date.now() - startTime,
            };
        }
    }

    /**
     * Start queue processor
     */
    private startQueueProcessor(): void {
        if (this.processingInterval) {
            return;
        }

        logger.info("[ZAI] Starting queue processor");
        
        this.processingInterval = setInterval(async () => {
            if (this.isProcessing) {
                return;
            }

            this.isProcessing = true;
            
            try {
                await this.processQueueBatch();
            } catch (error) {
                logger.error("[ZAI] Queue processor error:", error);
            } finally {
                this.isProcessing = false;
            }
        }, ZAI_QUEUE_DELAY_MS);
    }

    /**
     * Process batch from queue
     */
    private async processQueueBatch(): Promise<void> {
        // Get batch from queue
        const batch = await redisClient.zrange(ZAI_QUEUE_KEY, 0, ZAI_QUEUE_BATCH_SIZE - 1);
        
        if (batch.length === 0) {
            return;
        }

        logger.debug(`[ZAI] Processing batch of ${batch.length} requests`);

        // Process in parallel
        await Promise.all(
            batch.map(async (item: string) => {
                try {
                    const request: ZAIRequest = JSON.parse(item);
                    
                    // Remove from queue
                    await redisClient.zrem(ZAI_QUEUE_KEY, item);
                    
                    // Process request
                    const result = await this.callZAI(request);
                    
                    // Store result
                    const resultKey = `zai:result:${request.id}`;
                    await redisClient.setex(resultKey, 300, JSON.stringify(result));
                    
                } catch (error) {
                    logger.error("[ZAI] Failed to process queue item:", error);
                }
            })
        );
    }

    /**
     * Stop queue processor
     */
    stopQueueProcessor(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
            logger.info("[ZAI] Queue processor stopped");
        }
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Clear entire queue (emergency use)
     */
    async clearQueue(): Promise<void> {
        await redisClient.del(ZAI_QUEUE_KEY);
        await redisClient.del(ZAI_PROCESSING_KEY);
        logger.warn("[ZAI] Queue cleared");
    }
}

// Singleton instance
let zaiManager: ZAIClientManager | null = null;

export const getZAIClient = (): ZAIClientManager => {
    if (!zaiManager) {
        zaiManager = new ZAIClientManager();
    }
    return zaiManager;
};

// Helper function for direct usage
export const zaiChatCompletion = async (
    params: {
        messages: any[];
        model?: string;
        temperature?: number;
        max_tokens?: number;
        response_format?: ZAIResponseFormat;
        priority?: number;
    }
): Promise<ZAIResponse> => {
    const client = getZAIClient();
    return client.createChatCompletion(params);
};

// Batch processing for multiple requests
export const zaiBatchProcess = async (
    requests: Array<{
        id: string;
        messages: any[];
        temperature?: number;
        max_tokens?: number;
        response_format?: ZAIResponseFormat;
        priority?: number;
    }>
): Promise<ZAIResponse[]> => {
    const client = getZAIClient();
    
    // Check if we should use Z.AI or Groq for batch
    const stats = await client.getQueueStats();
    
    if (stats.isBusy || !client.isAvailable()) {
        // Use Groq for entire batch
        logger.info(`[ZAI] Using Groq for batch of ${requests.length} requests`);
        
        return Promise.all(
            requests.map(async (req) => {
                const startTime = Date.now();
                try {
                    const result = await groqChatCompletion({
                        messages: req.messages,
                        model: env.GROQ_MODEL,
                        temperature: req.temperature ?? 0.7,
                        max_tokens: req.max_tokens ?? 2000,
                        response_format: req.response_format,
                    });

                    return {
                        id: req.id,
                        content: (result as any).choices[0]?.message?.content || "",
                        model: env.GROQ_MODEL,
                        success: true,
                        provider: "groq" as const,
                        processingTimeMs: Date.now() - startTime,
                    };
                } catch (error: any) {
                    return {
                        id: req.id,
                        content: "",
                        model: env.GROQ_MODEL,
                        success: false,
                        error: error.message,
                        provider: "groq" as const,
                        processingTimeMs: Date.now() - startTime,
                    };
                }
            })
        );
    }

    // Use Z.AI for batch (parallel processing)
    logger.info(`[ZAI] Using Z.AI for batch of ${requests.length} requests`);
    
    return Promise.all(
        requests.map((req) =>
            client.createChatCompletion({
                messages: req.messages,
                temperature: req.temperature,
                max_tokens: req.max_tokens,
                response_format: req.response_format,
                priority: req.priority ?? 5,
            })
        )
    );
};

export default getZAIClient;

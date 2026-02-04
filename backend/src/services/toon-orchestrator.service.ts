/**
 * TOON Orchestrator (Tools for Orchestration and Optimization of Narratives)
 * Parallel content generation with Redis queues and BAML integration
 * Primary: Z.AI (GLM 4.7), Fallback: Groq
 */

import { logger } from "../shared/utils/logger";
import redisClient from "../config/redis.client";
import { zaiChatCompletion, zaiBatchProcess, ZAIResponse, type ZAIResponseFormat } from "./z-ai-client.service";
import { groqChatCompletion } from "./groq-client.service";
import { env } from "../config/env";

// TOON Queue Keys
const TOON_QUEUE_PREFIX = "toon:";
const TOON_STAGE = {
    SELECTOR: `${TOON_QUEUE_PREFIX}selector`,
    RESEARCHER: `${TOON_QUEUE_PREFIX}researcher`,
    WRITER: `${TOON_QUEUE_PREFIX}writer`,
    OPTIMIZER: `${TOON_QUEUE_PREFIX}optimizer`,
    VALIDATOR: `${TOON_QUEUE_PREFIX}validator`,
};

// BAML Configuration
interface BAMLContentConfig {
    pillar: string;
    theme: string;
    angle: string;
    target_audience: string;
    engagement_goal: string;
    content_format: string;
    emotional_trigger: string;
    word_count_target: number;
    language: string;
    bilingual: boolean;
}

interface BAMLVoiceConfig {
    trait: string;
    humor_level: number;
    formality: number;
    enthusiasm: number;
    use_emoji: boolean;
    sentence_style: string;
}

interface TOONRequest {
    id: string;
    stage: keyof typeof TOON_STAGE;
    config: BAMLContentConfig;
    voice: BAMLVoiceConfig;
    used_hashes: string[];
    brand_context: string;
    priority: number;
    retry_count: number;
    max_retries: number;
    created_at: number;
}

interface TOONResult {
    id: string;
    stage: string;
    success: boolean;
    data?: any;
    error?: string;
    provider: "zai" | "groq" | "cache";
    processing_time_ms: number;
}

class TOONOrchestrator {
    private isRunning: boolean = false;
    private processors: Map<string, NodeJS.Timeout> = new Map();

    constructor() {
        logger.info("[TOON] Orchestrator initialized");
    }

    /**
     * Start all TOON processors
     */
    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        logger.info("[TOON] Starting all stage processors");

        // Start processor for each stage
        Object.keys(TOON_STAGE).forEach((stage) => {
            this.startStageProcessor(stage as keyof typeof TOON_STAGE);
        });
    }

    /**
     * Stop all TOON processors
     */
    stop(): void {
        this.isRunning = false;
        this.processors.forEach((interval, stage) => {
            clearInterval(interval);
            logger.info(`[TOON] Stopped ${stage} processor`);
        });
        this.processors.clear();
    }

    /**
     * Start processor for specific stage
     */
    private startStageProcessor(stage: keyof typeof TOON_STAGE): void {
        const queueKey = TOON_STAGE[stage];
        
        const interval = setInterval(async () => {
            if (!this.isRunning) return;
            
            try {
                await this.processStageBatch(stage, queueKey);
            } catch (error) {
                logger.error(`[TOON] Error in ${stage} processor:`, error);
            }
        }, 100); // 100ms between batches

        this.processors.set(stage, interval);
        logger.info(`[TOON] Started ${stage} processor`);
    }

    /**
     * Process batch from stage queue
     */
    private async processStageBatch(
        stage: keyof typeof TOON_STAGE,
        queueKey: string
    ): Promise<void> {
        // Get batch from queue (up to 5 items)
        const batch = await redisClient.zrange(queueKey, 0, 4);
        
        if (batch.length === 0) return;

        logger.debug(`[TOON] Processing ${batch.length} items in ${stage}`);

        // Process in parallel
        await Promise.all(
            batch.map(async (item: string) => {
                try {
                    const request: TOONRequest = JSON.parse(item);
                    
                    // Remove from queue
                    await redisClient.zrem(queueKey, item);
                    
                    // Process based on stage
                    const result = await this.executeStage(stage, request);
                    
                    // Store result
                    await this.storeResult(request.id, stage, result);
                    
                    // If successful and not final stage, queue next stage
                    if (result.success && stage !== "VALIDATOR") {
                        await this.queueNextStage(request, stage);
                    }
                    
                } catch (error: any) {
                    logger.error(`[TOON] Failed to process ${stage} item:`, error.message);
                }
            })
        );
    }

    /**
     * Execute specific stage logic
     */
    private async executeStage(
        stage: keyof typeof TOON_STAGE,
        request: TOONRequest
    ): Promise<TOONResult> {
        const startTime = Date.now();
        
        try {
            switch (stage) {
                case "SELECTOR":
                    return await this.executeSelector(request, startTime);
                case "RESEARCHER":
                    return await this.executeResearcher(request, startTime);
                case "WRITER":
                    return await this.executeWriter(request, startTime);
                case "OPTIMIZER":
                    return await this.executeOptimizer(request, startTime);
                case "VALIDATOR":
                    return await this.executeValidator(request, startTime);
                default:
                    throw new Error(`Unknown stage: ${stage}`);
            }
        } catch (error: any) {
            return {
                id: request.id,
                stage,
                success: false,
                error: error.message,
                provider: "zai",
                processing_time_ms: Date.now() - startTime,
            };
        }
    }

    /**
     * STAGE 1: SELECTOR - Select theme and angle
     */
    private async executeSelector(
        request: TOONRequest,
        startTime: number
    ): Promise<TOONResult> {
        const prompt = this.buildSelectorPrompt(request);
        
        const response = await this.callAI({
            messages: [
                { role: "system", content: "You are a content strategy expert." },
                { role: "user", content: prompt },
            ],
            temperature: 0.6,
            max_tokens: 500,
            response_format: { type: "json_object" },
            priority: request.priority,
        });

        return {
            id: request.id,
            stage: "SELECTOR",
            success: response.success,
            data: response.success ? JSON.parse(response.content) : null,
            error: response.error,
            provider: response.provider,
            processing_time_ms: Date.now() - startTime,
        };
    }

    /**
     * STAGE 2: RESEARCHER - Generate research context
     */
    private async executeResearcher(
        request: TOONRequest,
        startTime: number
    ): Promise<TOONResult> {
        const selectorResult = await this.getResult(request.id, "SELECTOR");

        if (!selectorResult?.data) {
            return {
                id: request.id,
                stage: "RESEARCHER",
                success: false,
                error: "Missing selector result",
                provider: "zai",
                processing_time_ms: Date.now() - startTime,
            };
        }
        
        const prompt = this.buildResearcherPrompt(request, selectorResult.data);
        
        const response = await this.callAI({
            messages: [
                { role: "system", content: "You are a research analyst." },
                { role: "user", content: prompt },
            ],
            temperature: 0.5,
            max_tokens: 800,
            response_format: { type: "json_object" },
            priority: request.priority,
        });

        return {
            id: request.id,
            stage: "RESEARCHER",
            success: response.success,
            data: response.success ? JSON.parse(response.content) : null,
            error: response.error,
            provider: response.provider,
            processing_time_ms: Date.now() - startTime,
        };
    }

    /**
     * STAGE 3: WRITER - Generate content
     */
    private async executeWriter(
        request: TOONRequest,
        startTime: number
    ): Promise<TOONResult> {
        const selectorResult = await this.getResult(request.id, "SELECTOR");
        const researcherResult = await this.getResult(request.id, "RESEARCHER");

        if (!selectorResult?.data || !researcherResult?.data) {
            return {
                id: request.id,
                stage: "WRITER",
                success: false,
                error: "Missing selector or researcher result",
                provider: "zai",
                processing_time_ms: Date.now() - startTime,
            };
        }
        
        const prompt = this.buildWriterPrompt(
            request,
            selectorResult.data,
            researcherResult.data
        );
        
        const response = await this.callAI({
            messages: [
                { role: "system", content: this.buildSystemPrompt(request) },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" },
            priority: request.priority,
        });

        return {
            id: request.id,
            stage: "WRITER",
            success: response.success,
            data: response.success ? JSON.parse(response.content) : null,
            error: response.error,
            provider: response.provider,
            processing_time_ms: Date.now() - startTime,
        };
    }

    /**
     * STAGE 4: OPTIMIZER - Optimize and score content
     */
    private async executeOptimizer(
        request: TOONRequest,
        startTime: number
    ): Promise<TOONResult> {
        const writerResult = await this.getResult(request.id, "WRITER");

        if (!writerResult?.data) {
            return {
                id: request.id,
                stage: "OPTIMIZER",
                success: false,
                error: "Missing writer result",
                provider: "zai",
                processing_time_ms: Date.now() - startTime,
            };
        }
        
        const prompt = this.buildOptimizerPrompt(request, writerResult.data);
        
        const response = await this.callAI({
            messages: [
                { role: "system", content: "You are an SEO and engagement optimization expert." },
                { role: "user", content: prompt },
            ],
            temperature: 0.4,
            max_tokens: 2000,
            response_format: { type: "json_object" },
            priority: request.priority,
        });

        return {
            id: request.id,
            stage: "OPTIMIZER",
            success: response.success,
            data: response.success ? JSON.parse(response.content) : null,
            error: response.error,
            provider: response.provider,
            processing_time_ms: Date.now() - startTime,
        };
    }

    /**
     * STAGE 5: VALIDATOR - Final validation
     */
    private async executeValidator(
        request: TOONRequest,
        startTime: number
    ): Promise<TOONResult> {
        const optimizerResult = await this.getResult(request.id, "OPTIMIZER");

        if (!optimizerResult?.data) {
            return {
                id: request.id,
                stage: "VALIDATOR",
                success: false,
                error: "Missing optimizer result",
                provider: "zai",
                processing_time_ms: Date.now() - startTime,
            };
        }
        
        const prompt = this.buildValidatorPrompt(request, optimizerResult.data);
        
        const response = await this.callAI({
            messages: [
                { role: "system", content: "You are a content quality validator." },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: "json_object" },
            priority: request.priority,
        });

        return {
            id: request.id,
            stage: "VALIDATOR",
            success: response.success,
            data: response.success ? JSON.parse(response.content) : null,
            error: response.error,
            provider: response.provider,
            processing_time_ms: Date.now() - startTime,
        };
    }

    /**
     * Call AI service (Z.AI primary, Groq fallback)
     */
    private async callAI(params: {
        messages: any[];
        temperature: number;
        max_tokens: number;
        response_format?: ZAIResponseFormat;
        priority?: number;
    }): Promise<ZAIResponse> {
        return zaiChatCompletion({
            messages: params.messages,
            temperature: params.temperature,
            max_tokens: params.max_tokens,
            response_format: params.response_format,
            priority: params.priority ?? 5,
        });
    }

    /**
     * Submit request to TOON pipeline
     */
    async submitRequest(
        config: BAMLContentConfig,
        voice: BAMLVoiceConfig,
        used_hashes: string[],
        brand_context: string,
        priority: number = 5
    ): Promise<string> {
        const request: TOONRequest = {
            id: `toon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            stage: "SELECTOR",
            config,
            voice,
            used_hashes,
            brand_context,
            priority,
            retry_count: 0,
            max_retries: 3,
            created_at: Date.now(),
        };

        // Calculate score (lower = higher priority)
        const score = Date.now() + (10 - priority) * 1000;

        // Add to first stage queue
        await redisClient.zadd(TOON_STAGE.SELECTOR, score, JSON.stringify(request));

        logger.info(`[TOON] Request ${request.id} submitted to SELECTOR queue`);

        return request.id;
    }

    /**
     * Wait for request completion
     */
    async waitForCompletion(
        requestId: string,
        timeoutMs: number = 120000
    ): Promise<any> {
        const startTime = Date.now();
        const pollInterval = 500;

        while (Date.now() - startTime < timeoutMs) {
            await this.delay(pollInterval);

            // Check if validator result exists
            const validatorResult = await this.getResult(requestId, "VALIDATOR");
            
            if (validatorResult && validatorResult.success) {
                // Get optimizer result for full content
                const optimizerResult = await this.getResult(requestId, "OPTIMIZER");
                
                return {
                    id: requestId,
                    success: true,
                    content: optimizerResult?.data,
                    validation: validatorResult.data,
                    processing_time_ms: Date.now() - startTime,
                };
            }

            // Check for errors
            const stages = ["SELECTOR", "RESEARCHER", "WRITER", "OPTIMIZER", "VALIDATOR"];
            for (const stage of stages) {
                const result = await this.getResult(requestId, stage);
                if (result && !result.success) {
                    return {
                        id: requestId,
                        success: false,
                        error: result.error,
                        failed_stage: stage,
                    };
                }
            }
        }

        return {
            id: requestId,
            success: false,
            error: "Timeout waiting for completion",
        };
    }

    /**
     * Store stage result
     */
    private async storeResult(
        requestId: string,
        stage: string,
        result: TOONResult
    ): Promise<void> {
        const key = `${TOON_QUEUE_PREFIX}result:${requestId}:${stage}`;
        await redisClient.setex(key, 3600, JSON.stringify(result)); // 1 hour TTL
    }

    /**
     * Get stage result
     */
    private async getResult(requestId: string, stage: string): Promise<TOONResult | null> {
        const key = `${TOON_QUEUE_PREFIX}result:${requestId}:${stage}`;
        const data = await redisClient.get(key);
        
        if (data) {
            return JSON.parse(data);
        }
        
        return null;
    }

    /**
     * Queue next stage
     */
    private async queueNextStage(
        request: TOONRequest,
        currentStage: keyof typeof TOON_STAGE
    ): Promise<void> {
        const stageOrder: (keyof typeof TOON_STAGE)[] = [
            "SELECTOR",
            "RESEARCHER",
            "WRITER",
            "OPTIMIZER",
            "VALIDATOR",
        ];

        const currentIndex = stageOrder.indexOf(currentStage);
        const nextStage = stageOrder[currentIndex + 1];

        if (!nextStage) return;

        const nextRequest = {
            ...request,
            stage: nextStage,
        };

        const score = Date.now() + (10 - request.priority) * 1000;
        await redisClient.zadd(TOON_STAGE[nextStage], score, JSON.stringify(nextRequest));

        logger.debug(`[TOON] Request ${request.id} queued to ${nextStage}`);
    }

    /**
     * Get queue statistics
     */
    async getStats(): Promise<{
        selector: number;
        researcher: number;
        writer: number;
        optimizer: number;
        validator: number;
        total: number;
    }> {
        const [selector, researcher, writer, optimizer, validator] = await Promise.all([
            redisClient.zcard(TOON_STAGE.SELECTOR),
            redisClient.zcard(TOON_STAGE.RESEARCHER),
            redisClient.zcard(TOON_STAGE.WRITER),
            redisClient.zcard(TOON_STAGE.OPTIMIZER),
            redisClient.zcard(TOON_STAGE.VALIDATOR),
        ]);

        return {
            selector,
            researcher,
            writer,
            optimizer,
            validator,
            total: selector + researcher + writer + optimizer + validator,
        };
    }

    // Prompt builders
    private buildSelectorPrompt(request: TOONRequest): string {
        return `Select a unique theme for content generation:
Pillar: ${request.config.pillar}
Excluded themes: ${request.used_hashes.join(", ")}
Target audience: ${request.config.target_audience}

Respond with JSON:
{
    "theme_id": "...",
    "theme_title": "...",
    "angle": "...",
    "content_hash": "..."
}`;
    }

    private buildResearcherPrompt(request: TOONRequest, selectorData: any): string {
        return `Research context for:
Theme: ${selectorData.theme_title}
Angle: ${selectorData.angle}
Target: ${request.config.target_audience}

Generate JSON with key insights, statistics, and talking points.`;
    }

    private buildWriterPrompt(
        request: TOONRequest,
        selectorData: any,
        researcherData: any
    ): string {
        return `Write content following BAML schema:
Theme: ${selectorData.theme_title}
Research: ${JSON.stringify(researcherData)}
Voice: ${request.voice.trait} (humor: ${request.voice.humor_level}/10)
Goal: ${request.config.engagement_goal}
Format: ${request.config.content_format}

Generate complete content with all metrics.`;
    }

    private buildOptimizerPrompt(request: TOONRequest, contentData: any): string {
        return `Optimize this content for SEO, GEO, AEO, and Engagement:
${JSON.stringify(contentData)}

Calculate all scores and suggest improvements.
Respond with optimized content and metrics.`;
    }

    private buildValidatorPrompt(request: TOONRequest, optimizedData: any): string {
        return `Validate this content:
${JSON.stringify(optimizedData)}

Check:
1. All required fields present
2. Scores meet thresholds
3. No repetition from: ${request.used_hashes.join(", ")}
4. Content quality acceptable

Respond with { valid: boolean, issues: string[] }`;
    }

    private buildSystemPrompt(request: TOONRequest): string {
        return `You are an expert content writer using voice: ${request.voice.trait}.
Follow BAML schema exactly. Generate structured JSON response.`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Singleton
let toonOrchestrator: TOONOrchestrator | null = null;

export const getTOONOrchestrator = (): TOONOrchestrator => {
    if (!toonOrchestrator) {
        toonOrchestrator = new TOONOrchestrator();
    }
    return toonOrchestrator;
};

export default getTOONOrchestrator;

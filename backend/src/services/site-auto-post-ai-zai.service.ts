/**
 * Site Auto Post AI Service - Z.AI Primary (GLM 4.7)
 * Enhanced with TOON orchestration and BAML integration
 * Fallback to Groq when Z.AI is busy
 */

import { logger } from "../shared/utils/logger";
import { zaiChatCompletion, ZAIResponse } from "./z-ai-client.service";
import { groqChatCompletion } from "./groq-client.service";
import { getTOONOrchestrator } from "./toon-orchestrator.service";
import { SiteAutoPostScheduleEntity } from "../database/entity/site-auto-post-schedule-entity";
import { env } from "../config/env";

// Re-export interfaces from original service
export interface SiteContentSummary {
    summary: string;
    industry: string;
    expertise: string[];
    tone: string;
    targetAudience: string;
    contentPillars: string[];
}

export interface GeneratedSitePost {
    title: string;
    titleEn: string | null;
    content: string;
    contentEn: string | null;
    keywords: string;
    keywordsEn: string | null;
    metaDescription: string;
    slug: string;
    titleLength: number;
    metaDescriptionLength: number;
    wordCount: number;
    
    // Metrics
    seoScore: number;
    geoScore: number;
    aeoScore: number;
    engagementScore?: number;
    
    // Detailed metrics
    seoMetrics: {
        seoScore: number;
        titleOptimizationScore: number;
        metaDescriptionScore: number;
        contentStructureScore: number;
        keywordDensityScore: number;
        readabilityScore: number;
    };
    
    geoMetrics: {
        geoScore: number;
        entityRecognitionScore: number;
        answerOptimizationScore: number;
        structuredDataScore: number;
        authoritySignalsScore: number;
    };
    
    aeoMetrics: {
        aeoScore: number;
        answerRelevanceScore: number;
        directAnswerScore: number;
        questionOptimizationScore: number;
        voiceSearchScore: number;
    };
    
    contentQualityMetrics: {
        originalityScore: number;
        engagementPotentialScore: number;
    };
    
    improvementSuggestions: string[];
    
    // Provider info
    provider?: "zai" | "groq" | "cache";
    processingTimeMs?: number;
}

// BAML System Prompt for Z.AI
const BAML_SYSTEM_PROMPT = `You are PortyoAI Site Blog Writer, an expert SEO content creator.

=== BAML SCHEMA COMPLIANCE ===
Respond ONLY with valid JSON matching the BAML schema.
No markdown, no explanations outside JSON.

=== CONTENT REQUIREMENTS ===

TITLE:
- Compelling and click-worthy (50-60 characters)
- Include primary keyword naturally
- Create curiosity or promise value

CONTENT STRUCTURE:
- Hook readers in first paragraph (AIDA framework)
- Use H2 and H3 headings for structure
- Include bullet points and lists
- Write in specified tone and voice
- Length: 800-2500 words based on setting

SEO OPTIMIZATION:
- Primary keyword in first 100 words
- Semantic keywords throughout
- Natural keyword density (1-2%)
- Internal linking suggestions [LINK: anchor]

ENGAGEMENT:
- Minimum 3 strategic CTAs
- Social proof elements
- Pattern interrupts for readability
- Urgency without spam

=== RESPONSE FORMAT (BAML) ===
{
  "title": "Main Title",
  "titleEn": "English title (if bilingual)",
  "content": "Full markdown content",
  "contentEn": "English content (if bilingual)",
  "keywords": "keyword1, keyword2, keyword3",
  "keywordsEn": "english, keywords",
  "metaDescription": "Compelling meta (150-160 chars)",
  "slug": "url-friendly-slug",
  "titleLength": 55,
  "metaDescriptionLength": 158,
  "wordCount": 1200,
  "seoScore": 85,
  "geoScore": 82,
  "aeoScore": 78,
  "engagementScore": 87,
  "seoMetrics": {
    "seoScore": 85,
    "titleOptimizationScore": 90,
    "metaDescriptionScore": 88,
    "contentStructureScore": 85,
    "keywordDensityScore": 82,
    "readabilityScore": 80
  },
  "geoMetrics": {
    "geoScore": 82,
    "entityRecognitionScore": 85,
    "answerOptimizationScore": 80,
    "structuredDataScore": 83,
    "authoritySignalsScore": 81
  },
  "aeoMetrics": {
    "aeoScore": 78,
    "answerRelevanceScore": 80,
    "directAnswerScore": 75,
    "questionOptimizationScore": 77,
    "voiceSearchScore": 79
  },
  "contentQualityMetrics": {
    "originalityScore": 88,
    "engagementPotentialScore": 85
  },
  "improvementSuggestions": ["suggestion1", "suggestion2"]
}`;

/**
 * Generate content summary using Z.AI (GLM 4.7)
 */
export const generateSiteContentSummary = async (
    topics: string,
    targetAudience?: string | null,
    tone?: string
): Promise<SiteContentSummary> => {
    const prompt = `Analyze topics and create BAML-compliant content strategy:

Topics: ${topics}
Target Audience: ${targetAudience || "General audience"}
Tone: ${tone || "professional"}

Generate JSON with:
- summary: Brief focus description (2-3 sentences)
- industry: Primary industry/category
- expertise: Array of 5-7 key areas
- tone: Suggested writing tone
- targetAudience: Refined audience description
- contentPillars: Array of 4-6 pillars

Respond ONLY with valid JSON.`;

    try {
        const response = await zaiChatCompletion({
            messages: [
                { role: "system", content: "You are a content strategy expert using BAML." },
                { role: "user", content: prompt },
            ],
            temperature: 0.6,
            max_tokens: 1500,
            response_format: { type: "json_object" as const },
            priority: 7, // Higher priority for setup
        });

        if (!response.success) {
            throw new Error(response.error || "Z.AI failed");
        }

        const parsed = JSON.parse(response.content);
        
        return {
            summary: parsed.summary || "Professional blog covering industry insights.",
            industry: parsed.industry || "General",
            expertise: parsed.expertise || [],
            tone: parsed.tone || tone || "professional",
            targetAudience: parsed.targetAudience || targetAudience || "General audience",
            contentPillars: parsed.contentPillars || [],
        };
    } catch (error) {
        logger.error("[SiteAutoPostZAI] Error generating content summary:", error);
        
        // Fallback to Groq
        logger.info("[SiteAutoPostZAI] Falling back to Groq for content summary");
        
        try {
            const groqResponse = await groqChatCompletion({
                messages: [
                    { role: "system", content: "You are a content strategy expert." },
                    { role: "user", content: prompt },
                ],
                model: env.GROQ_MODEL,
                temperature: 0.6,
                max_tokens: 1500,
                response_format: { type: "json_object" as const },
            });

            const parsed = JSON.parse((groqResponse as any).choices[0]?.message?.content || "{}");
            
            return {
                summary: parsed.summary || "Professional blog covering industry insights.",
                industry: parsed.industry || "General",
                expertise: parsed.expertise || [],
                tone: parsed.tone || tone || "professional",
                targetAudience: parsed.targetAudience || targetAudience || "General audience",
                contentPillars: parsed.contentPillars || [],
            };
        } catch (fallbackError) {
            logger.error("[SiteAutoPostZAI] Groq fallback also failed:", fallbackError);
            
            return {
                summary: "Professional blog covering industry insights.",
                industry: "General",
                expertise: [],
                tone: tone || "professional",
                targetAudience: targetAudience || "General audience",
                contentPillars: [],
            };
        }
    }
};

/**
 * Generate site auto post using Z.AI (GLM 4.7) with BAML
 */
export const generateSiteAutoPost = async (
    schedule: SiteAutoPostScheduleEntity,
    contentSummary: SiteContentSummary,
    previousSuggestions: { seo: string[]; geo: string[]; aeo: string[] } | null
): Promise<GeneratedSitePost> => {
    const wordCountTarget = schedule.postLength === "short" ? 800 : 
                           schedule.postLength === "long" ? 2500 : 1500;

    const startTime = Date.now();

    // Build BAML-compliant prompt
    const prompt = `Create BAML-compliant blog post:

=== CONTENT FOCUS ===
Summary: ${contentSummary.summary}
Industry: ${contentSummary.industry}
Expertise: ${contentSummary.expertise.join(", ")}
Pillars: ${contentSummary.contentPillars.join(", ")}

=== CONFIGURATION ===
Topics: ${schedule.topics || "General industry insights"}
Target: ${contentSummary.targetAudience}
Tone: ${schedule.tone || "professional"}
Length: ~${wordCountTarget} words
Language: ${schedule.language || "pt"}
Bilingual: ${schedule.bilingual ? "Yes - PT and EN" : "No"}

=== VOICE CONFIG ===
Trait: ${schedule.voiceTrait || "professional"}
Humor: ${schedule.voiceHumorLevel || 3}/10
Formality: ${schedule.voiceFormality || 6}/10
Enthusiasm: ${schedule.voiceEnthusiasm || 7}/10
Emoji: ${schedule.voiceUseEmoji !== false ? "Yes" : "No"}

=== ENGAGEMENT OPTIMIZATION ===
Goal: ${schedule.engagementGoal || "conversions"}
Format: ${schedule.contentFormat || "how_to"}
Emotional Trigger: ${schedule.emotionalTrigger || "desire"}

=== PREVIOUS SUGGESTIONS ===
${previousSuggestions ? `
SEO: ${previousSuggestions.seo.join("; ")}
GEO: ${previousSuggestions.geo.join("; ")}
AEO: ${previousSuggestions.aeo.join("; ")}
` : "None - first post"}

Generate complete BAML-compliant JSON response.`;

    try {
        // Try Z.AI first
        const response = await zaiChatCompletion({
            messages: [
                { role: "system", content: BAML_SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: "json_object" as const },
            priority: 8, // High priority for content generation
        });

        if (!response.success) {
            throw new Error(response.error || "Z.AI generation failed");
        }

        const parsed = JSON.parse(response.content);
        const processingTime = Date.now() - startTime;

        logger.info(`[SiteAutoPostZAI] Generated post in ${processingTime}ms via ${response.provider}`);

        return parseGeneratedResponse(parsed, schedule, response.provider, processingTime);

    } catch (error) {
        logger.error("[SiteAutoPostZAI] Z.AI failed, falling back to Groq:", error);
        
        // Fallback to Groq
        return generateWithGroq(schedule, contentSummary, previousSuggestions, startTime);
    }
};

/**
 * Generate with Groq as fallback
 */
const generateWithGroq = async (
    schedule: SiteAutoPostScheduleEntity,
    contentSummary: SiteContentSummary,
    previousSuggestions: { seo: string[]; geo: string[]; aeo: string[] } | null,
    startTime: number
): Promise<GeneratedSitePost> => {
    const wordCountTarget = schedule.postLength === "short" ? 800 : 
                           schedule.postLength === "long" ? 2500 : 1500;

    const prompt = `Create BAML-compliant blog post:

=== CONTENT FOCUS ===
Summary: ${contentSummary.summary}
Industry: ${contentSummary.industry}
Expertise: ${contentSummary.expertise.join(", ")}

=== CONFIGURATION ===
Topics: ${schedule.topics || "General"}
Target: ${contentSummary.targetAudience}
Tone: ${schedule.tone || "professional"}
Length: ~${wordCountTarget} words
Language: ${schedule.language || "pt"}
Bilingual: ${schedule.bilingual ? "Yes" : "No"}

Generate complete BAML JSON response.`;

    try {
        const groqResponse = await groqChatCompletion({
            messages: [
                { role: "system", content: BAML_SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: "json_object" as const },
        });

        const parsed = JSON.parse((groqResponse as any).choices[0]?.message?.content || "{}");
        const processingTime = Date.now() - startTime;

        logger.info(`[SiteAutoPostZAI] Generated post via Groq fallback in ${processingTime}ms`);

        return parseGeneratedResponse(parsed, schedule, "groq", processingTime);

    } catch (error) {
        logger.error("[SiteAutoPostZAI] Groq fallback also failed:", error);
        throw error;
    }
};

/**
 * Parse generated response into structured format
 */
const parseGeneratedResponse = (
    response: any,
    schedule: SiteAutoPostScheduleEntity,
    provider: "zai" | "groq" | "cache",
    processingTimeMs: number
): GeneratedSitePost => {
    return {
        title: response.title || "Untitled Post",
        titleEn: schedule.bilingual ? response.titleEn || null : null,
        content: response.content || "",
        contentEn: schedule.bilingual ? response.contentEn || null : null,
        keywords: response.keywords || "",
        keywordsEn: schedule.bilingual ? response.keywordsEn || null : null,
        metaDescription: response.metaDescription || "",
        slug: response.slug || "untitled-post",
        titleLength: response.titleLength || response.title?.length || 0,
        metaDescriptionLength: response.metaDescriptionLength || response.metaDescription?.length || 0,
        wordCount: response.wordCount || 0,
        seoScore: response.seoScore || 70,
        geoScore: response.geoScore || 70,
        aeoScore: response.aeoScore || 70,
        engagementScore: response.engagementScore || 75,
        seoMetrics: response.seoMetrics || {
            seoScore: 70,
            titleOptimizationScore: 70,
            metaDescriptionScore: 70,
            contentStructureScore: 70,
            keywordDensityScore: 70,
            readabilityScore: 70,
        },
        geoMetrics: response.geoMetrics || {
            geoScore: 70,
            entityRecognitionScore: 70,
            answerOptimizationScore: 70,
            structuredDataScore: 70,
            authoritySignalsScore: 70,
        },
        aeoMetrics: response.aeoMetrics || {
            aeoScore: 70,
            answerRelevanceScore: 70,
            directAnswerScore: 70,
            questionOptimizationScore: 70,
            voiceSearchScore: 70,
        },
        contentQualityMetrics: response.contentQualityMetrics || {
            originalityScore: 70,
            engagementPotentialScore: 70,
        },
        improvementSuggestions: response.improvementSuggestions || [],
        provider,
        processingTimeMs,
    };
};

/**
 * Generate preview using TOON orchestration (parallel processing)
 */
export const generateSitePostPreviewWithTOON = async (
    schedule: Partial<SiteAutoPostScheduleEntity>,
    contentSummary: SiteContentSummary
): Promise<GeneratedSitePost> => {
    const toon = getTOONOrchestrator();

    // Build BAML config
    const config = {
        pillar: schedule.currentPillar || "educational",
        theme: schedule.topics || "General",
        angle: "preview",
        target_audience: schedule.targetAudience || "General",
        engagement_goal: schedule.engagementGoal || "conversions",
        content_format: schedule.contentFormat || "how_to",
        emotional_trigger: schedule.emotionalTrigger || "desire",
        word_count_target: schedule.postLength === "short" ? 800 : 
                          schedule.postLength === "long" ? 2500 : 1500,
        language: schedule.language || "pt",
        bilingual: schedule.bilingual !== false,
    };

    const voice = {
        trait: schedule.voiceTrait || "professional",
        humor_level: schedule.voiceHumorLevel || 3,
        formality: schedule.voiceFormality || 6,
        enthusiasm: schedule.voiceEnthusiasm || 7,
        use_emoji: schedule.voiceUseEmoji !== false,
        sentence_style: "varied",
    };

    // Submit to TOON
    const requestId = await toon.submitRequest(
        config,
        voice,
        [],
        "Portyo - Link in bio platform for creators",
        10 // Highest priority for preview
    );

    // Wait for completion
    const result = await toon.waitForCompletion(requestId, 60000);

    if (!result.success) {
        throw new Error(result.error || "TOON generation failed");
    }

    // Convert TOON result to GeneratedSitePost format
    return {
        ...result.content,
        provider: "zai",
        processingTimeMs: result.processing_time_ms,
    };
};

/**
 * Batch generate multiple posts (parallel processing)
 */
export const batchGenerateSitePosts = async (
    schedules: Array<{ schedule: SiteAutoPostScheduleEntity; contentSummary: SiteContentSummary }>
): Promise<GeneratedSitePost[]> => {
    logger.info(`[SiteAutoPostZAI] Starting batch generation of ${schedules.length} posts`);

    const requests = schedules.map((item, index) => ({
        id: `batch_${index}_${Date.now()}`,
        messages: [
            { role: "system", content: BAML_SYSTEM_PROMPT },
            { role: "user", content: buildBatchPrompt(item.schedule, item.contentSummary) },
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" as const },
        priority: 5,
    }));

    try {
        // Use Z.AI batch processing
        const { zaiBatchProcess } = await import("./z-ai-client.service");
        const responses = await zaiBatchProcess(requests);

        return responses.map((response, index) => {
            if (!response.success) {
                logger.error(`[SiteAutoPostZAI] Batch item ${index} failed:`, response.error);
                return createErrorPost(schedules[index].schedule, response.provider);
            }

            try {
                const parsed = JSON.parse(response.content);
                return parseGeneratedResponse(
                    parsed,
                    schedules[index].schedule,
                    response.provider,
                    response.processingTimeMs
                );
            } catch (parseError) {
                logger.error(`[SiteAutoPostZAI] Failed to parse batch item ${index}`);
                return createErrorPost(schedules[index].schedule, response.provider);
            }
        });
    } catch (error) {
        logger.error("[SiteAutoPostZAI] Batch processing failed:", error);
        
        // Fallback to sequential processing
        const results: GeneratedSitePost[] = [];
        for (const item of schedules) {
            try {
                const post = await generateSiteAutoPost(
                    item.schedule,
                    item.contentSummary,
                    null
                );
                results.push(post);
            } catch (e) {
                results.push(createErrorPost(item.schedule, "zai"));
            }
        }
        return results;
    }
};

/**
 * Build prompt for batch processing
 */
const buildBatchPrompt = (
    schedule: SiteAutoPostScheduleEntity,
    contentSummary: SiteContentSummary
): string => {
    const wordCountTarget = schedule.postLength === "short" ? 800 : 
                           schedule.postLength === "long" ? 2500 : 1500;

    return `Create BAML blog post:
Summary: ${contentSummary.summary}
Industry: ${contentSummary.industry}
Topics: ${schedule.topics || "General"}
Target: ${contentSummary.targetAudience}
Tone: ${schedule.tone || "professional"}
Length: ~${wordCountTarget} words
Language: ${schedule.language || "pt"}
Bilingual: ${schedule.bilingual ? "Yes" : "No"}

Generate BAML JSON.`;
};

/**
 * Create error placeholder post
 */
const createErrorPost = (
    schedule: SiteAutoPostScheduleEntity,
    provider: "zai" | "groq" | "cache"
): GeneratedSitePost => ({
    title: "Error - Could Not Generate",
    titleEn: null,
    content: "Generation failed. Please try again.",
    contentEn: null,
    keywords: "",
    keywordsEn: null,
    metaDescription: "",
    slug: "error-post",
    titleLength: 0,
    metaDescriptionLength: 0,
    wordCount: 0,
    seoScore: 0,
    geoScore: 0,
    aeoScore: 0,
    engagementScore: 0,
    seoMetrics: {
        seoScore: 0,
        titleOptimizationScore: 0,
        metaDescriptionScore: 0,
        contentStructureScore: 0,
        keywordDensityScore: 0,
        readabilityScore: 0,
    },
    geoMetrics: {
        geoScore: 0,
        entityRecognitionScore: 0,
        answerOptimizationScore: 0,
        structuredDataScore: 0,
        authoritySignalsScore: 0,
    },
    aeoMetrics: {
        aeoScore: 0,
        answerRelevanceScore: 0,
        directAnswerScore: 0,
        questionOptimizationScore: 0,
        voiceSearchScore: 0,
    },
    contentQualityMetrics: {
        originalityScore: 0,
        engagementPotentialScore: 0,
    },
    improvementSuggestions: ["Retry generation"],
    provider,
    processingTimeMs: 0,
});

export default {
    generateSiteContentSummary,
    generateSiteAutoPost,
    generateSitePostPreviewWithTOON,
    batchGenerateSitePosts,
};

/**
 * BAML Adapter for Auto Post AI Service
 * 
 * This adapter provides structured prompts following BAML (Basically A Made-up Language) patterns
 * for type-safe AI interactions. It works alongside TOON for token-efficient data transmission.
 * 
 * BAML provides:
 * - Type-safe prompt engineering
 * - Structured input/output contracts
 * - Schema validation
 * 
 * TOON provides:
 * - ~40% token reduction vs JSON
 * - Efficient data serialization
 * 
 * Combined: Type-safe, token-efficient AI interactions
 */

import { ToonService, ToonTemplates } from './toon.service';
import { logger } from '../shared/utils/logger';

// ========== TYPE DEFINITIONS (Matching BAML Schemas) ==========

/**
 * Bio summary output from BAML GenerateBioSummary function
 */
export interface BioSummary {
    summary: string;
    industry: string;
    expertise: string[];
    tone: string;
    targetAudience: string;
    uniqueSellingPoints: string[];
    contentPillars: string[];
}

/**
 * SEO metrics from BAML SEOMetrics class
 */
export interface SEOMetrics {
    seoScore: number;
    titleOptimizationScore: number;
    metaDescriptionScore: number;
    contentStructureScore: number;
    keywordDensityScore: number;
    readabilityScore: number;
    internalLinkingScore: number;
}

/**
 * GEO metrics from BAML GEOMetrics class
 */
export interface GEOMetrics {
    geoScore: number;
    entityRecognitionScore: number;
    answerOptimizationScore: number;
    structuredDataScore: number;
    authoritySignalsScore: number;
    contextClarityScore: number;
    conversationalValueScore: number;
    featuredSnippetScore: number;
}

/**
 * AEO metrics from BAML AEOMetrics class
 */
export interface AEOMetrics {
    aeoScore: number;
    answerRelevanceScore: number;
    directAnswerScore: number;
    questionOptimizationScore: number;
    voiceSearchScore: number;
    clarityScore: number;
    concisenessScore: number;
    factualAccuracyScore: number;
}

/**
 * AIO metrics from BAML AIOMetrics class
 */
export interface AIOMetrics {
    aioScore: number;
    promptEfficiencyScore: number;
    contextAdherenceScore: number;
    hallucinationResistanceScore: number;
    citationQualityScore: number;
    multiTurnOptimizationScore: number;
    instructionFollowingScore: number;
    outputConsistencyScore: number;
}

/**
 * Content quality metrics from BAML
 */
export interface ContentQualityMetrics {
    originalityScore: number;
    depthScore: number;
    engagementPotentialScore: number;
    freshnessScore: number;
}

/**
 * Keyword analysis from BAML
 */
export interface KeywordAnalysis {
    primaryKeyword: string;
    secondaryKeywords: string[];
    semanticKeywords: string[];
    keywordDensity: number;
    lsiKeywords: string[];
}

/**
 * Readability metrics from BAML
 */
export interface ReadabilityMetrics {
    fleschReadingEase: number;
    fleschKincaidGrade: number;
    averageSentenceLength: number;
    averageWordLength: number;
    totalWords: number;
    totalSentences: number;
}

/**
 * Content analysis from BAML
 */
export interface ContentAnalysis {
    headingsCount: number;
    h2Count: number;
    h3Count: number;
    paragraphCount: number;
    listCount: number;
    imageCount: number;
    internalLinksCount: number;
    externalLinksCount: number;
    hasCTA: boolean;
    contentDepth: 'basic' | 'standard' | 'comprehensive' | 'expert';
}

/**
 * Entity analysis from BAML
 */
export interface EntityAnalysis {
    mainEntities: string[];
    relatedEntities: string[];
    entitySalience: Record<string, number>;
    topicCategories: string[];
}

/**
 * AI optimization from BAML
 */
export interface AIOptimization {
    answerTargets: string[];
    questionCoverage: string[];
    snippetCandidates: string[];
    voiceSearchOptimized: boolean;
    chatGptFriendly: boolean;
}

/**
 * Complete generated post from BAML GeneratedPost class
 */
export interface GeneratedPost {
    title: string;
    content: string;
    keywords: string;
    slug: string;
    metaDescription: string;
    titleLength: number;
    metaDescriptionLength: number;
    seoMetrics: SEOMetrics;
    geoMetrics: GEOMetrics;
    aeoMetrics: AEOMetrics;
    aioMetrics: AIOMetrics;
    contentQualityMetrics: ContentQualityMetrics;
    keywordAnalysis: KeywordAnalysis;
    readabilityMetrics: ReadabilityMetrics;
    contentAnalysis: ContentAnalysis;
    entityAnalysis: EntityAnalysis;
    aiOptimization: AIOptimization;
    improvementSuggestions: string[];
    geoSuggestions: string[];
    aeoSuggestions: string[];
    aioSuggestions: string[];
}

/**
 * Bio input for BAML GenerateBioSummary function
 */
export interface BioInput {
    displayName: string;
    username: string;
    description: string;
    seoDescription: string;
    blocksContent: string;
}

/**
 * Post generation input for BAML GenerateAutoPost function
 */
export interface PostGenerationInput {
    authorName: string;
    bioSummary: string;
    industry: string;
    expertise: string[];
    uniqueSellingPoints: string[];
    targetAudience: string;
    contentPillars: string[];
    topics: string;
    keywords: string;
    tone: string;
    length: string;
    language: string;
    targetCountry?: string | null;
}

// ========== BAML SYSTEM PROMPTS ==========

/**
 * BAML-style system prompts for structured AI interactions
 */
export const BAML_SYSTEM_PROMPTS = {
    
    /**
     * Bio summary generation prompt
     */
    bioSummary: `You are an expert brand strategist and content marketer.
Analyze professional profiles deeply to extract strategic insights for content creation.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "string (2-3 sentence compelling summary)",
  "industry": "string (primary industry with niche)",
  "expertise": ["string array (5-7 skills)"],
  "tone": "string (professional, casual, authoritative, creative, friendly, technical)",
  "targetAudience": "string (detailed persona)",
  "uniqueSellingPoints": ["string array (3-5 differentiators)"],
  "contentPillars": ["string array (4-6 content themes)"]
}

Guidelines:
- Be specific and actionable
- Identify content opportunities
- Understand their unique angle
- Consider SEO/GEO/AEO implications`,

    /**
     * Auto post generation prompt
     */
    autoPost: `You are an elite content strategist, SEO expert, GEO specialist, AEO and AIO Master.
You create content that dominates search rankings, is optimized for AI consumption, and provides direct answers for voice search and answer engines.

CRITICAL RULES:
1. Content MUST be in CLEAN MARKDOWN format (NOT HTML)
2. Use # for H1, ## for H2, ### for H3 (only one H1 at the beginning)
3. Use **bold** and *italic* (NOT HTML tags)
4. Use - for lists, 1. 2. 3. for numbered lists
5. 60%+ of headers should be questions for AEO optimization
6. Include direct answers within first 40-60 words of each section
7. NEVER use HTML tags like <p>, <div>, <h1>, <strong>, <em>, <ul>, <ol>

Respond with valid JSON matching the GeneratedPost schema with complete metrics.

Scoring Guidelines (be honest and critical):
- 90-100: Exceptional, publish-ready
- 80-89: Very good, minor tweaks
- 70-79: Good, needs some optimization
- 60-69: Acceptable, significant improvements needed
- Below 60: Needs major revision`,

    /**
     * Content validation prompt
     */
    validation: `You are a critical content analyst. You provide honest, accurate metrics.
You never inflate scores. You analyze content methodically and provide specific, actionable feedback.

Be critical:
- 90-100: Truly exceptional in every aspect
- 80-89: Very good, minor improvements possible
- 70-79: Good but needs several optimizations
- 60-69: Acceptable, significant issues present
- Below 60: Major problems, needs revision

Return ONLY valid JSON with precise scores and specific improvement suggestions.`,

    /**
     * Bio generation prompt for onboarding
     */
    bioGeneration: `You are an expert bio writer and personal brand strategist.
Create compelling, professional bios that showcase expertise and personality.

Guidelines:
- Highlight key achievements and skills
- Show personality while maintaining professionalism
- Include clear value proposition
- Optimize for the target audience
- Keep it concise but impactful

Return ONLY valid JSON matching the requested schema.`,

    /**
     * Metadata generation prompt
     */
    metadataGeneration: `You are an expert SEO specialist and content strategist.
You generate precise, actionable metadata for blog content optimization.

Guidelines:
- Keywords should include a mix of head terms and long-tail keywords
- Tags should be broad enough for categorization but specific to the niche
- Target audience should include demographics, pain points, and goals
- Suggested topics should be actionable and specific
- Content angles should highlight unique perspectives

Return ONLY valid JSON matching the requested schema.`
};

// ========== HELPER FUNCTIONS ==========

/**
 * Build a BAML-style prompt with TOON-formatted data
 */
export function buildBAMLPrompt(
    template: keyof typeof BAML_SYSTEM_PROMPTS,
    data: any,
    options?: {
        useTOON?: boolean;
        context?: Record<string, any>;
    }
): { system: string; user: string; tokenSavings?: number } {
    const useTOON = options?.useTOON !== false; // Default to true
    const systemPrompt = BAML_SYSTEM_PROMPTS[template];
    
    let userPrompt: string;
    let tokenSavings = 0;
    
    if (useTOON) {
        const toonData = ToonService.encode(data);
        const jsonSize = JSON.stringify(data, null, 2).length;
        const toonSize = toonData.length;
        tokenSavings = Math.ceil((jsonSize - toonSize) / 4); // Approximate tokens
        
        userPrompt = `DATA (TOON format):
${toonData}`;
        
        if (options?.context) {
            userPrompt += `\n\nCONTEXT (TOON format):\n${ToonService.encode(options.context)}`;
        }
    } else {
        userPrompt = `DATA (JSON format):
${JSON.stringify(data, null, 2)}`;
        
        if (options?.context) {
            userPrompt += `\n\nCONTEXT (JSON format):\n${JSON.stringify(options.context, null, 2)}`;
        }
    }
    
    return { system: systemPrompt, user: userPrompt, tokenSavings };
}

/**
 * Build bio summary generation prompt
 */
export function buildBioSummaryPrompt(bioInput: BioInput): { system: string; user: string; tokenSavings: number } {
    const bioData = {
        displayName: bioInput.displayName,
        username: bioInput.username,
        description: bioInput.description,
        seoDescription: bioInput.seoDescription,
        blocks: JSON.parse(bioInput.blocksContent || '[]')
    };
    
    const toonData = ToonTemplates.bioEntity(bioData);
    const tokenSavings = calculateTokenSavings(bioData);
    
    const systemPrompt = BAML_SYSTEM_PROMPTS.bioSummary;
    
    const userPrompt = `Analyze this bio/portfolio and create a strategic summary.

BIO DATA (TOON format):
${toonData}

Generate a detailed BioSummary object. Return ONLY valid JSON.`;
    
    return { system: systemPrompt, user: userPrompt, tokenSavings };
}

/**
 * Build auto post generation prompt
 */
export function buildAutoPostPrompt(
    input: PostGenerationInput,
    previousSuggestions?: { seo: string[]; geo: string[]; aeo: string[]; aio: string[] } | null
): { system: string; user: string; tokenSavings: number } {
    
    // Build TOON-formatted data
    const authorData = {
        id: '',
        username: input.authorName,
        displayName: input.authorName,
        description: input.bioSummary,
        seoDescription: '',
        blocks: []
    };
    
    const scheduleData = {
        topics: input.topics,
        keywords: input.keywords.split(',').map(k => k.trim()),
        tone: input.tone,
        length: input.length,
        targetCountry: input.targetCountry || '',
        language: input.language
    };
    
    const summaryData = {
        summary: input.bioSummary,
        industry: input.industry,
        expertise: input.expertise,
        tone: input.tone,
        targetAudience: input.targetAudience,
        uniqueSellingPoints: input.uniqueSellingPoints,
        contentPillars: input.contentPillars
    };
    
    const bioToon = ToonTemplates.bioEntity(authorData);
    const scheduleToon = ToonTemplates.autoPostSchedule(scheduleData);
    const summaryToon = ToonTemplates.bioSummary(summaryData);
    
    // Calculate token savings
    const combinedJson = {
        author: authorData,
        schedule: scheduleData,
        summary: summaryData
    };
    const tokenSavings = calculateTokenSavings(combinedJson);
    
    let userPrompt = `Create an EXCEPTIONAL blog post optimized for SEO, GEO, AEO, and AIO.

=== AUTHOR PROFILE (TOON) ===
${bioToon}

=== BIO SUMMARY (TOON) ===
${summaryToon}

=== POST REQUIREMENTS (TOON) ===
${scheduleToon}`;
    
    if (previousSuggestions) {
        const suggestionsToon = ToonService.encode(previousSuggestions);
        userPrompt += `\n\n=== IMPROVEMENT SUGGESTIONS (TOON) ===\n${suggestionsToon}\n\nCRITICAL: Address ALL suggestions in this new post. Demonstrate measurable improvement.`;
    }
    
    userPrompt += `\n\n=== REQUIREMENTS ===
1. Title: 50-60 chars, keyword-rich, click-worthy
2. Meta Description: 150-160 chars, compelling CTA
3. Content: Markdown format with proper hierarchy
4. AEO: Question-based headers (60%+), direct answers 40-60 words
5. GEO: Clear entities, E-E-A-T signals, structured data ready
6. AIO: Verifiable facts, consistent voice, clear structure

Return a complete GeneratedPost object with all metrics and suggestions.`;
    
    return { system: BAML_SYSTEM_PROMPTS.autoPost, user: userPrompt, tokenSavings };
}

/**
 * Build content validation prompt
 */
export function buildValidationPrompt(
    generatedPost: GeneratedPost,
    bioSummary: BioSummary,
    targetCountry?: string | null
): { system: string; user: string } {
    
    const postToon = ToonService.encode({
        title: generatedPost.title,
        metaDescription: generatedPost.metaDescription,
        content: generatedPost.content.substring(0, 2000) + '...'
    });
    
    const summaryToon = ToonTemplates.bioSummary(bioSummary);
    
    const userPrompt = `CRITICALLY ANALYZE this blog post and calculate PRECISE metrics.

=== CONTENT (TOON) ===
${postToon}

=== CONTEXT (TOON) ===
${summaryToon}
${targetCountry ? `Target Country: ${targetCountry}` : ''}

Return validated metrics in the same format as GeneratedPost with specific improvement suggestions.`;
    
    return { system: BAML_SYSTEM_PROMPTS.validation, user: userPrompt };
}

/**
 * Calculate approximate token savings from using TOON
 */
export function calculateTokenSavings(jsonData: any): number {
    const jsonStr = JSON.stringify(jsonData, null, 2);
    const toonStr = ToonService.encode(jsonData);
    const jsonTokens = Math.ceil(jsonStr.length / 4);
    const toonTokens = Math.ceil(toonStr.length / 4);
    return jsonTokens - toonTokens;
}

// ========== RESPONSE VALIDATION ==========

/**
 * Validate that a response matches BioSummary schema
 */
export function validateBioSummaryResponse(response: any): BioSummary {
    return {
        summary: response?.summary || '',
        industry: response?.industry || 'General',
        expertise: Array.isArray(response?.expertise) ? response.expertise : [],
        tone: response?.tone || 'professional',
        targetAudience: response?.targetAudience || 'General audience',
        uniqueSellingPoints: Array.isArray(response?.uniqueSellingPoints) ? response.uniqueSellingPoints : [],
        contentPillars: Array.isArray(response?.contentPillars) ? response.contentPillars : []
    };
}

/**
 * Validate that a response matches GeneratedPost schema
 */
export function validateGeneratedPostResponse(response: any): GeneratedPost {
    const defaultSEOMetrics: SEOMetrics = {
        seoScore: 70, titleOptimizationScore: 70, metaDescriptionScore: 70,
        contentStructureScore: 70, keywordDensityScore: 70, readabilityScore: 70, internalLinkingScore: 70
    };
    
    const defaultGEOMetrics: GEOMetrics = {
        geoScore: 70, entityRecognitionScore: 70, answerOptimizationScore: 70, structuredDataScore: 70,
        authoritySignalsScore: 70, contextClarityScore: 70, conversationalValueScore: 70, featuredSnippetScore: 70
    };
    
    const defaultAEOMetrics: AEOMetrics = {
        aeoScore: 70, answerRelevanceScore: 70, directAnswerScore: 70, questionOptimizationScore: 70,
        voiceSearchScore: 70, clarityScore: 70, concisenessScore: 70, factualAccuracyScore: 70
    };
    
    const defaultAIOMetrics: AIOMetrics = {
        aioScore: 70, promptEfficiencyScore: 70, contextAdherenceScore: 70, hallucinationResistanceScore: 70,
        citationQualityScore: 70, multiTurnOptimizationScore: 70, instructionFollowingScore: 70, outputConsistencyScore: 70
    };
    
    return {
        title: response?.title || 'Untitled Post',
        content: response?.content || '',
        keywords: response?.keywords || '',
        slug: response?.slug || '',
        metaDescription: response?.metaDescription || '',
        titleLength: response?.titleLength || response?.title?.length || 0,
        metaDescriptionLength: response?.metaDescriptionLength || response?.metaDescription?.length || 0,
        seoMetrics: { ...defaultSEOMetrics, ...response?.seoMetrics },
        geoMetrics: { ...defaultGEOMetrics, ...response?.geoMetrics },
        aeoMetrics: { ...defaultAEOMetrics, ...response?.aeoMetrics },
        aioMetrics: { ...defaultAIOMetrics, ...response?.aioMetrics },
        contentQualityMetrics: {
            originalityScore: 70, depthScore: 70, engagementPotentialScore: 70, freshnessScore: 70,
            ...response?.contentQualityMetrics
        },
        keywordAnalysis: response?.keywordAnalysis || {
            primaryKeyword: '', secondaryKeywords: [], semanticKeywords: [], keywordDensity: 0, lsiKeywords: []
        },
        readabilityMetrics: response?.readabilityMetrics || {
            fleschReadingEase: 60, fleschKincaidGrade: 10, averageSentenceLength: 15,
            averageWordLength: 4.5, totalWords: 0, totalSentences: 0
        },
        contentAnalysis: response?.contentAnalysis || {
            headingsCount: 0, h2Count: 0, h3Count: 0, paragraphCount: 0, listCount: 0,
            imageCount: 0, internalLinksCount: 0, externalLinksCount: 0, hasCTA: false, contentDepth: 'standard'
        },
        entityAnalysis: response?.entityAnalysis || {
            mainEntities: [], relatedEntities: [], entitySalience: {}, topicCategories: []
        },
        aiOptimization: response?.aiOptimization || {
            answerTargets: [], questionCoverage: [], snippetCandidates: [],
            voiceSearchOptimized: false, chatGptFriendly: false
        },
        improvementSuggestions: response?.improvementSuggestions || [],
        geoSuggestions: response?.geoSuggestions || [],
        aeoSuggestions: response?.aeoSuggestions || [],
        aioSuggestions: response?.aioSuggestions || []
    };
}

/**
 * Log token savings for monitoring
 */
export function logTokenSavings(operation: string, savings: number): void {
    if (savings > 0) {
        logger.info(`[BAML+TOON] ${operation}: Saved ~${savings} tokens`);
    }
}

// ========== BAML ADAPTER STATS ==========

/**
 * Get BAML adapter statistics
 */
export function getBAMLAdapterStats(): {
    version: string;
    description: string;
    features: string[];
    toonEnabled: boolean;
} {
    return {
        version: '1.0.0',
        description: 'BAML + TOON integration for structured AI prompts',
        features: [
            'Type-safe prompt engineering',
            'Token-efficient data transmission',
            'Schema validation',
            'Response normalization',
            'TOON optimization'
        ],
        toonEnabled: process.env.USE_TOON_OPTIMIZATION !== 'false'
    };
}

export default {
    buildBAMLPrompt,
    buildBioSummaryPrompt,
    buildAutoPostPrompt,
    buildValidationPrompt,
    validateBioSummaryResponse,
    validateGeneratedPostResponse,
    calculateTokenSavings,
    logTokenSavings,
    getBAMLAdapterStats,
    BAML_SYSTEM_PROMPTS
};

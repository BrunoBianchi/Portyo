import { env } from "../config/env";
import { BioEntity } from "../database/entity/bio-entity";
import { AutoPostScheduleEntity } from "../database/entity/auto-post-schedule-entity";
import { groqChatCompletion } from "./groq-client.service";
import { logger } from "../shared/utils/logger";

// Import TOON service and templates for token optimization
import { ToonService, ToonTemplates } from './toon.service';

const getCompletionContent = (
    completion: Awaited<ReturnType<typeof groqChatCompletion>>
): string | null => {
    if ("choices" in completion) {
        return completion.choices[0]?.message?.content ?? null;
    }
    return null;
};

// Language mapping for countries
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
    // Portuguese speaking
    "BR": "Portuguese (Brazilian)",
    "PT": "Portuguese (European)",
    "AO": "Portuguese (Angolan)",
    "MZ": "Portuguese (Mozambican)",
    // English speaking
    "US": "English (American)",
    "GB": "English (British)",
    "CA": "English (Canadian)",
    "AU": "English (Australian)",
    "IN": "English (Indian)",
    // Spanish speaking
    "ES": "Spanish (European)",
    "MX": "Spanish (Mexican)",
    "AR": "Spanish (Argentinian)",
    "CO": "Spanish (Colombian)",
    "CL": "Spanish (Chilean)",
    "PE": "Spanish (Peruvian)",
    // French speaking
    "FR": "French",
    "BE": "French (Belgian)",
    "CH": "French (Swiss)",
    // German speaking
    "DE": "German",
    "AT": "German (Austrian)",
    // Italian
    "IT": "Italian",
    // Dutch
    "NL": "Dutch",
    // Japanese
    "JP": "Japanese",
    // Korean
    "KR": "Korean",
    // Chinese
    "CN": "Chinese (Simplified)",
    "TW": "Chinese (Traditional)",
    "HK": "Chinese (Traditional)",
    // Russian
    "RU": "Russian",
    // Arabic
    "SA": "Arabic",
    "AE": "Arabic",
    "EG": "Arabic",
    // Turkish
    "TR": "Turkish",
    // Polish
    "PL": "Polish",
    // Swedish
    "SE": "Swedish",
    // Norwegian
    "NO": "Norwegian",
    // Danish
    "DK": "Danish",
    // Finnish
    "FI": "Finnish",
    // Hebrew
    "IL": "Hebrew",
    // Hindi
    "IN-hi": "Hindi",
    // Indonesian
    "ID": "Indonesian",
    // Malay
    "MY": "Malay",
    // Thai
    "TH": "Thai",
    // Vietnamese
    "VN": "Vietnamese",
};

/**
 * Get language based on target country
 */
export const getLanguageByCountry = (countryCode: string | null): string | null => {
    if (!countryCode) return null;
    return COUNTRY_LANGUAGE_MAP[countryCode] || null;
};

/**
 * Get the language instruction for AI prompts
 */
export const getLanguageInstruction = (schedule: AutoPostScheduleEntity): string => {
    // Priority: explicit language > country-based language > auto-detect
    if (schedule.language && schedule.language !== "auto-detect") {
        return schedule.language;
    }
    
    if (schedule.targetCountry) {
        const countryLang = getLanguageByCountry(schedule.targetCountry);
        if (countryLang) {
            return countryLang;
        }
    }
    
    return "auto-detect (match the bio's language naturally)";
};

// ========== TOON OPTIMIZATION CONFIG ==========

/**
 * Flag to enable/disable TOON optimization
 * Set USE_TOON_OPTIMIZATION=false in environment to disable
 */
export const USE_TOON_OPTIMIZATION = process.env.USE_TOON_OPTIMIZATION !== 'false';

/**
 * Log token savings for monitoring
 */
export function logTokenSavings(operation: string, jsonData: any, toonData?: string): void {
    if (!USE_TOON_OPTIMIZATION) return;
    
    try {
        const savings = ToonService.calculateSavings(jsonData);
        if (savings.savings > 0) {
            logger.info(`[TOON] ${operation}: Saved ~${savings.percent}% (${savings.savings} tokens)`);
        }
    } catch (error) {
        // Silent fail - don't break functionality for logging
    }
}

// ========== TOON CONVERSION HELPERS ==========

/**
 * Convert BioEntity to TOON format
 */
export function bioToTOON(bio: BioEntity): string {
    if (!USE_TOON_OPTIMIZATION) {
        return JSON.stringify({
            displayName: bio.seoTitle || bio.sufix,
            username: bio.sufix,
            description: bio.description,
            seoDescription: bio.seoDescription,
            blocks: bio.blocks
        }, null, 2);
    }
    
    const result = ToonTemplates.bioEntity(bio);
    
    // Log savings
    const data = {
        displayName: bio.seoTitle || bio.sufix,
        username: bio.sufix,
        description: bio.description || '',
        seoDescription: bio.seoDescription || '',
        blocks: bio.blocks
    };
    logTokenSavings('BioEntity', data);
    
    return result;
}

/**
 * Convert AutoPostScheduleEntity to TOON format
 */
export function scheduleToTOON(schedule: AutoPostScheduleEntity): string {
    if (!USE_TOON_OPTIMIZATION) {
        return JSON.stringify({
            topics: schedule.topics,
            keywords: schedule.keywords,
            tone: schedule.tone,
            length: schedule.postLength,
            targetCountry: schedule.targetCountry,
            language: schedule.language
        }, null, 2);
    }
    
    const result = ToonTemplates.autoPostSchedule(schedule);
    
    // Log savings
    const data = {
        topics: schedule.topics,
        keywords: schedule.keywords,
        tone: schedule.tone,
        length: schedule.postLength,
        targetCountry: schedule.targetCountry,
        language: schedule.language
    };
    logTokenSavings('ScheduleEntity', data);
    
    return result;
}

/**
 * Convert BioSummary to TOON format
 */
export function summaryToTOON(summary: BioSummary): string {
    if (!USE_TOON_OPTIMIZATION) {
        return JSON.stringify(summary, null, 2);
    }
    
    const result = ToonTemplates.bioSummary(summary);
    logTokenSavings('BioSummary', summary);
    
    return result;
}

// ========== INTERFACES ==========

export interface KeywordAnalysis {
    primaryKeyword: string;
    secondaryKeywords: string[];
    semanticKeywords: string[];
    keywordDensity: number;
    lsiKeywords: string[];
}

export interface ReadabilityMetrics {
    fleschReadingEase: number;
    fleschKincaidGrade: number;
    averageSentenceLength: number;
    averageWordLength: number;
    totalWords: number;
    totalSentences: number;
}

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
    contentDepth: "basic" | "standard" | "comprehensive" | "expert";
}

export interface EntityAnalysis {
    mainEntities: string[];
    relatedEntities: string[];
    entitySalience: Record<string, number>;
    topicCategories: string[];
}

export interface AIOptimization {
    answerTargets: string[];
    questionCoverage: string[];
    snippetCandidates: string[];
    voiceSearchOptimized: boolean;
    chatGptFriendly: boolean;
}

export interface SEOMetrics {
    seoScore: number;
    titleOptimizationScore: number;
    metaDescriptionScore: number;
    contentStructureScore: number;
    keywordDensityScore: number;
    readabilityScore: number;
    internalLinkingScore: number;
}

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

export interface ContentQualityMetrics {
    originalityScore: number;
    depthScore: number;
    engagementPotentialScore: number;
    freshnessScore: number;
}

export interface GeneratedPost {
    title: string;
    content: string;
    keywords: string;
    slug: string;
    metaDescription: string;

    // Scores
    seoMetrics: SEOMetrics;
    geoMetrics: GEOMetrics;
    aeoMetrics: AEOMetrics;
    aioMetrics: AIOMetrics;
    contentQualityMetrics: ContentQualityMetrics;

    // Detailed Analysis
    keywordAnalysis: KeywordAnalysis;
    readabilityMetrics: ReadabilityMetrics;
    contentAnalysis: ContentAnalysis;
    entityAnalysis: EntityAnalysis;
    aiOptimization: AIOptimization;

    // Suggestions
    improvementSuggestions: string[];
    geoSuggestions: string[];
    aeoSuggestions: string[];
    aioSuggestions: string[];

    // Meta
    titleLength: number;
    metaDescriptionLength: number;
}

export interface BioSummary {
    summary: string;
    industry: string;
    expertise: string[];
    tone: string;
    targetAudience: string;
    uniqueSellingPoints: string[];
    contentPillars: string[];
}

// ========== BIO SUMMARY GENERATION ==========

export const generateBioSummary = async (
    bio: BioEntity
): Promise<BioSummary> => {
    const blocksContent = bio.blocks ? JSON.stringify(bio.blocks, null, 2) : "";
    const description = bio.description || "";
    const seoDescription = bio.seoDescription || "";
    const displayName = bio.seoTitle || bio.sufix || "";
    const username = bio.sufix || "";

    // Use TOON format if enabled
    const bioData = {
        displayName,
        username,
        description,
        seoDescription,
        blocks: bio.blocks || []
    };
    
    let bioDataFormatted: string;
    if (USE_TOON_OPTIMIZATION) {
        bioDataFormatted = ToonTemplates.bioEntity(bioData);
        logTokenSavings('BioSummary generation', bioData);
        logger.info('[AutoPostAI] Using TOON format for bio summary');
    } else {
        bioDataFormatted = JSON.stringify(bioData, null, 2);
        logger.info('[AutoPostAI] Using JSON format for bio summary');
    }

    const prompt = `Analyze this bio/portfolio page and create a comprehensive, strategic summary for AI content generation.

BIO INFORMATION (${USE_TOON_OPTIMIZATION ? 'TOON' : 'JSON'} format):
${bioDataFormatted}

Generate a detailed JSON object with this structure:
{
  "summary": "A compelling 2-3 sentence summary capturing the essence, value proposition, and expertise",
  "industry": "Primary industry with niche specification (e.g., 'SaaS Content Marketing', 'Portrait Photography')",
  "expertise": ["5-7 specific skills/areas of deep expertise"],
  "tone": "Primary communication tone (professional, casual, authoritative, creative, friendly, technical)",
  "targetAudience": "Detailed audience persona - who they serve, pain points, goals",
  "uniqueSellingPoints": ["3-5 unique differentiators that set them apart"],
  "contentPillars": ["4-6 main content themes/topics they should focus on"]
}

GUIDELINES:
- Be specific and actionable
- Identify content opportunities
- Understand their unique angle
- Consider SEO/GEO/AEO implications

Return ONLY valid JSON.`;

    try {
        const completion = await groqChatCompletion({
            messages: [
                {
                    role: "system",
                    content: "You are an expert brand strategist and content marketer. Analyze professional profiles deeply to extract strategic insights for content creation.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.4,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        });

        const responseContent = getCompletionContent(completion);

        if (!responseContent) {
            throw new Error("No response from AI");
        }

        const parsedResponse = JSON.parse(responseContent);

        return {
            summary: parsedResponse.summary || "",
            industry: parsedResponse.industry || "General",
            expertise: Array.isArray(parsedResponse.expertise) ? parsedResponse.expertise : [],
            tone: parsedResponse.tone || "professional",
            targetAudience: parsedResponse.targetAudience || "General audience",
            uniqueSellingPoints: Array.isArray(parsedResponse.uniqueSellingPoints) ? parsedResponse.uniqueSellingPoints : [],
            contentPillars: Array.isArray(parsedResponse.contentPillars) ? parsedResponse.contentPillars : [],
        };
    } catch (error) {
        console.error("Error generating bio summary:", error);
        return {
            summary: description || seoDescription || "Professional portfolio",
            industry: "General",
            expertise: [],
            tone: "professional",
            targetAudience: "General audience",
            uniqueSellingPoints: [],
            contentPillars: [],
        };
    }
};

// ========== ADVANCED POST GENERATION ==========

export const generateAutoPost = async (
    bio: BioEntity,
    schedule: AutoPostScheduleEntity,
    bioSummary: BioSummary,
    previousSuggestions?: {
        seo: string[];
        geo: string[];
        aeo: string[];
        aio: string[];
    } | null,
    previousTitles?: string[]
): Promise<GeneratedPost> => {
    const topics = schedule.topics || bioSummary.contentPillars.join(", ") || bioSummary.industry;
    const keywords = schedule.keywords?.join(", ") || bioSummary.expertise.join(", ");
    const tone = schedule.tone || bioSummary.tone;
    const targetAudience = schedule.targetAudience || bioSummary.targetAudience;
    const postLength = schedule.postLength || "medium";
    // Language is now fixed based on country selection
    const language = getLanguageInstruction(schedule);
    const usp = bioSummary.uniqueSellingPoints.join("; ");

    // Build topic diversity section to prevent repetition
    const topicDiversitySection = previousTitles && previousTitles.length > 0 ? `
=== TOPIC DIVERSITY - CRITICAL ===
You MUST create a post about a COMPLETELY DIFFERENT subtopic/angle than the ones listed below.
DO NOT repeat or rephrase any of these previous titles. Choose a fresh, unique angle within the given topics.

Previously published posts (AVOID these topics/angles):
${previousTitles.map((title, i) => `${i + 1}. "${title}"`).join("\n")}

RULES:
- Pick a different subtopic, trend, or perspective from the topic list
- If topics include multiple subjects (e.g., "React, career tips, web dev"), rotate between them
- Even within the same broad topic, find a unique angle (e.g., beginner vs advanced, tutorial vs opinion, tools vs concepts)
- Never rewrite or closely paraphrase a previous title
` : "";

    // Build suggestions section if previous suggestions exist
    const suggestionsSection = previousSuggestions ? `
=== IMPROVEMENT SUGGESTIONS FROM PREVIOUS POST ===
Address these specific recommendations to improve upon the previous post:

${previousSuggestions.seo.length > 0 ? `SEO Improvements Needed:
${previousSuggestions.seo.map((s, i) => `${i + 1}. ${s}`).join("\n")}

` : ""}${previousSuggestions.geo.length > 0 ? `GEO Improvements Needed:
${previousSuggestions.geo.map((s, i) => `${i + 1}. ${s}`).join("\n")}

` : ""}${previousSuggestions.aeo.length > 0 ? `AEO Improvements Needed:
${previousSuggestions.aeo.map((s, i) => `${i + 1}. ${s}`).join("\n")}

` : ""}${previousSuggestions.aio.length > 0 ? `AIO Improvements Needed:
${previousSuggestions.aio.map((s, i) => `${i + 1}. ${s}`).join("\n")}

` : ""}CRITICAL: Actively address ALL the above suggestions in this new post. Demonstrate measurable improvement in the corresponding metrics.
` : "";

    const lengthGuide = {
        short: { words: "600-800", sections: "3-4", detail: "concise overview" },
        medium: { words: "1000-1500", sections: "5-6", detail: "balanced depth" },
        long: { words: "1800-2500", sections: "7-9", detail: "comprehensive coverage" },
    };

    const length = lengthGuide[postLength as keyof typeof lengthGuide];

    // Build target country section
    const targetCountrySection = schedule.targetCountry ? `
=== TARGET GEOGRAPHY: ${schedule.targetCountry} ===
CRITICAL: This content is specifically targeted for ${schedule.targetCountry}. You MUST:
1. Use local spelling, terminology, and expressions common in ${schedule.targetCountry}
2. Reference local laws, regulations, and standards when relevant
3. Use ${schedule.targetCountry} specific examples, case studies, and cultural references
4. Adapt currency, units of measurement, and date formats to ${schedule.targetCountry} standards
5. Consider local search behavior and content preferences in ${schedule.targetCountry}
6. Include locally relevant entities, organizations, and authorities from ${schedule.targetCountry}
7. Optimize for local SEO factors specific to ${schedule.targetCountry} market
8. Use region-specific keywords and search terms popular in ${schedule.targetCountry}
` : "";

    // Prepare author and post data for TOON formatting
    const authorData = {
        id: bio.id,
        username: bio.sufix,
        displayName: bio.seoTitle || bio.sufix,
        description: bio.description || '',
        seoDescription: bio.seoDescription || '',
        blocks: bio.blocks || []
    };
    
    const scheduleData = {
        topics: schedule.topics,
        keywords: schedule.keywords || [],
        tone: schedule.tone,
        length: schedule.postLength,
        targetAudience: schedule.targetAudience,
        targetCountry: schedule.targetCountry,
        language: schedule.language
    };
    
    // Format data based on TOON optimization setting
    let authorFormatted: string;
    let scheduleFormatted: string;
    
    if (USE_TOON_OPTIMIZATION) {
        authorFormatted = ToonTemplates.bioEntity(authorData);
        scheduleFormatted = ToonTemplates.autoPostSchedule(scheduleData);
        
        // Calculate and log token savings
        const combinedData = { author: authorData, schedule: scheduleData, bioSummary };
        const savings = ToonService.calculateSavings(combinedData);
        logger.info(`[AutoPostAI] TOON optimization: ${savings.percent}% savings (${savings.savings} tokens)`);
    } else {
        authorFormatted = JSON.stringify(authorData, null, 2);
        scheduleFormatted = JSON.stringify(scheduleData, null, 2);
        logger.info('[AutoPostAI] Using standard JSON format');
    }

    const prompt = `Create an EXCEPTIONAL, publication-ready blog post optimized for Search Engines (SEO), Generative AI (GEO), and Answer Engines (AEO).

=== AUTHOR PROFILE (${USE_TOON_OPTIMIZATION ? 'TOON' : 'JSON'}) ===
Name: ${bio.seoTitle || bio.sufix}
Bio: ${bioSummary.summary}
Industry: ${bioSummary.industry}
Expertise: ${bioSummary.expertise.join(", ")}
Unique Selling Points: ${usp}
Target Audience: ${targetAudience}
Content Pillars: ${bioSummary.contentPillars.join(", ")}

Full Author Data:
${authorFormatted}

=== POST REQUIREMENTS (${USE_TOON_OPTIMIZATION ? 'TOON' : 'JSON'}) ===
Topic Focus: ${topics}
Target Keywords: ${keywords}
Tone of Voice: ${tone}
Length: ${length.words} words, ${length.sections} sections, ${length.detail}
Language: ${language === "auto-detect" ? "Match the bio's language naturally" : language}

${scheduleFormatted}

${targetCountrySection}

${topicDiversitySection}

${suggestionsSection}

=== SEO REQUIREMENTS (Advanced) ===
1. Title: 50-60 characters, keyword-rich, click-worthy, emotional trigger, power words
2. Meta Description: 150-160 characters, compelling CTA, primary keyword, unique value proposition
3. Headers: Proper H1->H2->H3 hierarchy, keyword variations, question-based H2s for featured snippets
4. Content: Natural keyword density (1-2%), semantic keywords, LSI terms, entity-rich content
5. Structure: Short paragraphs (2-3 sentences), scannable content, proper use of white space
6. Links: Context for 2-3 internal links, 1-2 authoritative external links with descriptive anchor text
7. Media: Image alt text suggestions, video embed opportunities, infographics potential
8. Schema Ready: Content structured for FAQ, HowTo, Article schema markup
9. URL Optimization: Short, keyword-rich slug with hyphens
10. Mobile-First: Content readable on mobile devices, concise paragraphs

=== GEO REQUIREMENTS (Generative Engine Optimization - Advanced) ===
1. Entity-First: Lead with clear named entities (people, companies, concepts) with rich context
2. Knowledge Graph: Content that could appear in Google's Knowledge Graph
3. Semantic Relationships: Explicit connections between entities and concepts
4. E-E-A-T Signals: Clear demonstration of Experience, Expertise, Authoritativeness, Trustworthiness
5. AI Citations: Content structured for AI systems to cite as authoritative source
6. Contextual Disambiguation: Clear topic boundaries, resolves ambiguity
7. Conversational Patterns: Natural dialogue flow, anticipates follow-up questions
8. Structured Information: Tables, comparison charts, definition boxes
9. Cited Sources: Real, verifiable sources that AI can reference
10. Topical Authority: Comprehensive coverage demonstrating subject mastery

=== AEO REQUIREMENTS (Answer Engine Optimization - Advanced) ===
1. Position Zero Strategy: Every section should target a specific featured snippet type
2. Direct Answers: Immediate, concise answers within first 40-60 words of each section
3. Question-Based Architecture: 60%+ of H2/H3 headers formatted as questions ("What is...", "How to...", "Why...")
4. Snippet Diversity: Paragraph snippets (40-60 words), List snippets (bullets/steps), Table snippets (comparisons)
5. Voice Search Optimization: Natural language patterns, conversational tone, concise 1-2 sentence responses
6. People Also Ask Coverage: Anticipate and answer 3-5 related follow-up questions explicitly
7. Fact-Rich Content: Specific data points, statistics, dates, percentages with citations
8. Definition Optimization: Clear, concise definitions formatted for dictionary snippets
9. How-To Structure: Numbered steps with clear action items for process queries
10. Comparison Framework: Side-by-side comparisons for "vs", "best", "difference between" queries

=== MARKDOWN FORMATTING REQUIREMENTS ===
CRITICAL: Generate content in CLEAN MARKDOWN format (NOT HTML). DO NOT use HTML tags like <p>, <h1>, <strong>, etc.

Use ONLY these Markdown syntaxes:
- Use # for main title (H1) - only one at the beginning
- Use ## for section headers (H2)
- Use ### for subsection headers (H3)
- Use **bold** for emphasis (NOT <strong>)
- Use *italic* for subtle emphasis (NOT <em>)
- Use [link text](URL) for links
- Use - or * for unordered lists (NOT <ul>/<li>)
- Use 1. 2. 3. for ordered lists (NOT <ol>/<li>)
- Use > for blockquotes (NOT <blockquote>)
- Use \`inline code\` for technical terms (NOT <code>)
- Use \`\`\`language\ncode block\n\`\`\` for code
- Use | Column 1 | Column 2 | for tables
- Use --- for horizontal rules
- Leave blank lines between paragraphs

EXAMPLE OF CORRECT FORMAT (use backticks without spaces):
- Main Title: # Main Title
- Section: ## Section Header  
- Bold: **bold text**
- Italic: *italic text*
- List: - item 1
- Code: use backticks around inline code

NEVER use HTML tags like <p>, <div>, <h1>, <h2>, <strong>, <em>, <ul>, <ol>, <li>, etc.

=== AIO REQUIREMENTS (AI Optimization - CRITICAL) ===
1. Prompt Efficiency: Clear, unambiguous instructions that minimize token waste
2. Context Adherence: Strictly follow provided bio/profile context without deviation
3. Hallucination Resistance: No fabricated facts, statistics, or claims - only verifiable information
4. Citation Quality: Reference real, verifiable sources when making claims
5. Multi-Turn Optimization: Content that works well in conversational AI and chat contexts
6. Instruction Following: Precisely match requested format, tone, length, and style
7. Output Consistency: Maintain consistent voice, terminology, and quality throughout
8. AI-Friendly Format: Clear section boundaries, consistent terminology for LLM processing
9. Knowledge Graph Ready: Clear subject-predicate-object relationships in statements
10. RAG-Optimized: Content that works well as context in Retrieval-Augmented Generation systems

AIO SCORING CRITERIA (be critical and honest):
- promptEfficiencyScore: How well the content follows clear, efficient structure (0-100)
- contextAdherenceScore: How well content sticks to the provided bio context without deviation (0-100)
- hallucinationResistanceScore: Absence of fabricated facts, all claims verifiable (0-100)
- citationQualityScore: Presence and quality of real, verifiable source citations (0-100)
- multiTurnOptimizationScore: Content suitability for conversational AI contexts (0-100)
- instructionFollowingScore: Adherence to format, tone, length requirements (0-100)
- outputConsistencyScore: Consistent voice, terminology throughout (0-100)
- aioScore: Overall average of all AIO metrics (0-100)

=== CONTENT QUALITY STANDARDS ===
- Original insights and unique perspectives
- Actionable advice with specific examples
- Data-driven points where relevant
- Engaging hook in first 100 words
- Strong conclusion with clear CTA
- Emotional resonance with target audience
- AEO-optimized: Answer-focused structure with clear, scannable sections
- AIO-optimized: AI-friendly structure for Groq/LLM consumption

Return a COMPREHENSIVE JSON object:

{
  "title": "Optimized title (50-60 chars)",
  "slug": "url-friendly-slug-with-keywords",
  "content": "Full content in MARKDOWN format with proper headers, lists, emphasis, and links",
  "keywords": "primary, secondary, semantic, keywords, for, seo",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "titleLength": 55,
  "metaDescriptionLength": 158,
  
  "seoMetrics": {
    "seoScore": 92,
    "titleOptimizationScore": 95,
    "metaDescriptionScore": 90,
    "contentStructureScore": 88,
    "keywordDensityScore": 85,
    "readabilityScore": 87,
    "internalLinkingScore": 82
  },
  
  "geoMetrics": {
    "geoScore": 89,
    "entityRecognitionScore": 92,
    "answerOptimizationScore": 88,
    "structuredDataScore": 90,
    "authoritySignalsScore": 87,
    "contextClarityScore": 91,
    "conversationalValueScore": 85,
    "featuredSnippetScore": 88
  },
  
  "aeoMetrics": {
    "aeoScore": 91,
    "answerRelevanceScore": 94,
    "directAnswerScore": 92,
    "questionOptimizationScore": 89,
    "voiceSearchScore": 88,
    "clarityScore": 93,
    "concisenessScore": 87,
    "factualAccuracyScore": 90
  },

  "aioMetrics": {
    "aioScore": <calculate based on actual content quality 0-100>,
    "promptEfficiencyScore": <0-100 based on structural clarity>,
    "contextAdherenceScore": <0-100 based on bio context alignment>,
    "hallucinationResistanceScore": <0-100 based on factual accuracy>,
    "citationQualityScore": <0-100 based on source quality>,
    "multiTurnOptimizationScore": <0-100 based on conversational suitability>,
    "instructionFollowingScore": <0-100 based on requirements adherence>,
    "outputConsistencyScore": <0-100 based on voice consistency>
  }
  
  "contentQualityMetrics": {
    "originalityScore": 90,
    "depthScore": 88,
    "engagementPotentialScore": 92,
    "freshnessScore": 85
  },
  
  "keywordAnalysis": {
    "primaryKeyword": "main target keyword",
    "secondaryKeywords": ["keyword2", "keyword3", "keyword4"],
    "semanticKeywords": ["related1", "related2", "related3"],
    "keywordDensity": 1.5,
    "lsiKeywords": ["latent semantic indexing terms"]
  },
  
  "readabilityMetrics": {
    "fleschReadingEase": 65,
    "fleschKincaidGrade": 8.5,
    "averageSentenceLength": 16,
    "averageWordLength": 4.8,
    "totalWords": 1250,
    "totalSentences": 78
  },
  
  "contentAnalysis": {
    "headingsCount": 8,
    "h2Count": 5,
    "h3Count": 3,
    "paragraphCount": 24,
    "listCount": 4,
    "imageCount": 3,
    "internalLinksCount": 3,
    "externalLinksCount": 2,
    "hasCTA": true,
    "contentDepth": "comprehensive"
  },
  
  "entityAnalysis": {
    "mainEntities": ["Entity1", "Entity2"],
    "relatedEntities": ["Related1", "Related2"],
    "entitySalience": {"Entity1": 0.8, "Entity2": 0.6},
    "topicCategories": ["Category1", "Category2"]
  },
  
  "aiOptimization": {
    "answerTargets": ["Question1", "Question2"],
    "questionCoverage": ["Covered1", "Covered2"],
    "snippetCandidates": ["List for snippet", "Table data"],
    "voiceSearchOptimized": true,
    "chatGptFriendly": true
  },
  
  "improvementSuggestions": [
    "Specific SEO improvement 1",
    "Specific SEO improvement 2"
  ],
  
  "geoSuggestions": [
    "GEO optimization 1",
    "GEO optimization 2"
  ],
  
  "aeoSuggestions": [
    "AEO optimization 1 - Add more direct answers",
    "AEO optimization 2 - Include more question headers"
  ],
    "aioSuggestions": [
    "AIO optimization 1 - Add more direct answers",
    "AIO optimization 2 - Include more question headers"
  ]

}

SCORING GUIDELINES (be honest and critical):
- 90-100: Exceptional, publish-ready
- 80-89: Very good, minor tweaks
- 70-79: Good, needs some optimization
- 60-69: Acceptable, significant improvements needed
- Below 60: Needs major revision

Return ONLY valid JSON. No markdown, no code blocks.`;

    try {
        const completion = await groqChatCompletion({
            messages: [
                {
                    role: "system",
                    content: "You are an elite content strategist, SEO expert, GEO specialist, AEO and AIO Master. You create content that dominates search rankings, is optimized for AI consumption, and provides direct answers for voice search and answer engines. You are meticulous about metrics and always provide detailed analysis.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.75,
            max_tokens: 8192,
            response_format: { type: "json_object" },
        });

        const responseContent = getCompletionContent(completion);

        if (!responseContent) {
            throw new Error("No response from AI");
        }

        const parsedResponse = JSON.parse(responseContent);

        // Generate slug if not provided or sanitize it
        let slug = parsedResponse.slug || generateSlug(parsedResponse.title);
        slug = sanitizeSlug(slug);

        // Ensure all metrics exist with defaults
        const defaultSEOMetrics: SEOMetrics = {
            seoScore: 70,
            titleOptimizationScore: 70,
            metaDescriptionScore: 70,
            contentStructureScore: 70,
            keywordDensityScore: 70,
            readabilityScore: 70,
            internalLinkingScore: 70,
        };

        const defaultGEOMetrics: GEOMetrics = {
            geoScore: 70,
            entityRecognitionScore: 70,
            answerOptimizationScore: 70,
            structuredDataScore: 70,
            authoritySignalsScore: 70,
            contextClarityScore: 70,
            conversationalValueScore: 70,
            featuredSnippetScore: 70,
        };

        const defaultAEOMetrics: AEOMetrics = {
            aeoScore: 70,
            answerRelevanceScore: 70,
            directAnswerScore: 70,
            questionOptimizationScore: 70,
            voiceSearchScore: 70,
            clarityScore: 70,
            concisenessScore: 70,
            factualAccuracyScore: 70,
        };

        const defaultAIOMetrics: AIOMetrics = {
            aioScore: 70,
            promptEfficiencyScore: 70,
            contextAdherenceScore: 70,
            hallucinationResistanceScore: 70,
            citationQualityScore: 70,
            multiTurnOptimizationScore: 70,
            instructionFollowingScore: 70,
            outputConsistencyScore: 70,
        };

        const defaultContentQuality: ContentQualityMetrics = {
            originalityScore: 70,
            depthScore: 70,
            engagementPotentialScore: 70,
            freshnessScore: 70,
        };

        return {
            title: parsedResponse.title || "Untitled Post",
            content: parsedResponse.content || "",
            keywords: parsedResponse.keywords || keywords,
            slug: slug,
            metaDescription: parsedResponse.metaDescription || "",
            titleLength: parsedResponse.titleLength || parsedResponse.title?.length || 0,
            metaDescriptionLength: parsedResponse.metaDescriptionLength || parsedResponse.metaDescription?.length || 0,

            seoMetrics: { ...defaultSEOMetrics, ...parsedResponse.seoMetrics },
            geoMetrics: { ...defaultGEOMetrics, ...parsedResponse.geoMetrics },
            aeoMetrics: { ...defaultAEOMetrics, ...parsedResponse.aeoMetrics },
            aioMetrics: { ...defaultAIOMetrics, ...parsedResponse.aioMetrics },
            contentQualityMetrics: { ...defaultContentQuality, ...parsedResponse.contentQualityMetrics },

            keywordAnalysis: parsedResponse.keywordAnalysis || {
                primaryKeyword: "",
                secondaryKeywords: [],
                semanticKeywords: [],
                keywordDensity: 0,
                lsiKeywords: [],
            },

            readabilityMetrics: parsedResponse.readabilityMetrics || {
                fleschReadingEase: 60,
                fleschKincaidGrade: 10,
                averageSentenceLength: 15,
                averageWordLength: 4.5,
                totalWords: 0,
                totalSentences: 0,
            },

            contentAnalysis: parsedResponse.contentAnalysis || {
                headingsCount: 0,
                h2Count: 0,
                h3Count: 0,
                paragraphCount: 0,
                listCount: 0,
                imageCount: 0,
                internalLinksCount: 0,
                externalLinksCount: 0,
                hasCTA: false,
                contentDepth: "standard",
            },

            entityAnalysis: parsedResponse.entityAnalysis || {
                mainEntities: [],
                relatedEntities: [],
                entitySalience: {},
                topicCategories: [],
            },

            aiOptimization: parsedResponse.aiOptimization || {
                answerTargets: [],
                questionCoverage: [],
                snippetCandidates: [],
                voiceSearchOptimized: false,
                chatGptFriendly: false,
            },

            improvementSuggestions: parsedResponse.improvementSuggestions || [],
            geoSuggestions: parsedResponse.geoSuggestions || [],
            aeoSuggestions: parsedResponse.aeoSuggestions || [],
            aioSuggestions: parsedResponse.aioSuggestions || [],
        };
    } catch (error) {
        console.error("Error generating auto post:", error);
        throw error;
    }
};

// ========== CONTENT VALIDATION & METRICS ==========

export const validateContentAndCalculateMetrics = async (
    generatedPost: GeneratedPost,
    bio: BioEntity,
    schedule: AutoPostScheduleEntity,
    bioSummary: BioSummary
): Promise<GeneratedPost> => {
    const targetCountry = schedule.targetCountry;
    
    // Use TOON format for validation if enabled
    let contentFormatted: string;
    let summaryFormatted: string;
    
    if (USE_TOON_OPTIMIZATION) {
        const postData = {
            title: generatedPost.title,
            metaDescription: generatedPost.metaDescription,
            content: generatedPost.content.substring(0, 2000) + '...'
        };
        contentFormatted = ToonService.encode(postData);
        summaryFormatted = ToonTemplates.bioSummary(bioSummary);
        logger.info('[AutoPostAI] Using TOON format for validation');
    } else {
        contentFormatted = JSON.stringify({
            title: generatedPost.title,
            metaDescription: generatedPost.metaDescription,
            content: generatedPost.content.substring(0, 2000) + '...'
        }, null, 2);
        summaryFormatted = JSON.stringify(bioSummary, null, 2);
    }
    
    const validationPrompt = `You are an expert content analyzer and SEO/GEO/AEO/AIO specialist. Your task is to CRITICALLY ANALYZE the following blog post and calculate PRECISE, HONEST metrics.

=== AUTHOR PROFILE ===
Name: ${bio.seoTitle || bio.sufix}
Bio: ${bioSummary.summary}
Industry: ${bioSummary.industry}
Expertise: ${bioSummary.expertise.join(", ")}
Target Audience: ${bioSummary.targetAudience}
${targetCountry ? `Target Country: ${targetCountry} (Content must be culturally and locally appropriate for this country)` : ""}

Bio Summary (${USE_TOON_OPTIMIZATION ? 'TOON' : 'JSON'}):
${summaryFormatted}

=== GENERATED CONTENT ===
TITLE: ${generatedPost.title}
META DESCRIPTION: ${generatedPost.metaDescription}
CONTENT (${USE_TOON_OPTIMIZATION ? 'TOON' : 'JSON'}):
${contentFormatted}

=== YOUR TASK ===
Analyze this content CRITICALLY and return PRECISE scores (0-100) and detailed analysis.

BE HONEST AND CRITICAL - don't give inflated scores. A good post should score 75-85, exceptional 90+.

Return ONLY this JSON structure:

{
  "seoMetrics": {
    "seoScore": <overall SEO 0-100>,
    "titleOptimizationScore": <0-100: Is title 50-60 chars? Keyword-rich? Click-worthy?>,
    "metaDescriptionScore": <0-100: Is meta 150-160 chars? Compelling CTA?>,
    "contentStructureScore": <0-100: Proper H1/H2/H3? Headers optimized?>,
    "keywordDensityScore": <0-100: Natural keyword usage? Semantic keywords?>,
    "readabilityScore": <0-100: Short paragraphs? Scannable?>,
    "internalLinkingScore": <0-100: Context for internal links? External links?>
  },
  
  "geoMetrics": {
    "geoScore": <overall GEO 0-100>,
    "entityRecognitionScore": <0-100: Clear named entities? Context provided?>,
    "answerOptimizationScore": <0-100: Direct answers to user questions?>,
    "structuredDataScore": <0-100: Tables/lists for snippets? Schema-ready?>,
    "authoritySignalsScore": <0-100: E-E-A-T demonstrated?>,
    "contextClarityScore": <0-100: Topic disambiguation? Semantic relationships?>,
    "conversationalValueScore": <0-100: Q&A sections? Voice-search ready?>,
    "featuredSnippetScore": <0-100: Snippet opportunities utilized?>
  },
  
  "aeoMetrics": {
    "aeoScore": <overall AEO 0-100>,
    "answerRelevanceScore": <0-100: How well does it answer user queries?>,
    "directAnswerScore": <0-100: Immediate answers in 40-60 words?>,
    "questionOptimizationScore": <0-100: H2/H3 as questions?>,
    "voiceSearchScore": <0-100: Natural language? Conversational tone?>,
    "clarityScore": <0-100: Clear, unambiguous information?>,
    "concisenessScore": <0-100: Brief without losing details?>,
    "factualAccuracyScore": <0-100: Verifiable claims? Data points?>
  },
  
  "aioMetrics": {
    "aioScore": <overall AIO 0-100 - calculated average of all AIO sub-metrics>,
    "promptEfficiencyScore": <0-100: Content structure is clear and efficient for AI processing?>,
    "contextAdherenceScore": <0-100: How well does content stick to the provided bio context?>,
    "hallucinationResistanceScore": <0-100: Are all facts verifiable with no fabricated claims?>,
    "citationQualityScore": <0-100: Quality and presence of real, verifiable source citations?>,
    "multiTurnOptimizationScore": <0-100: Does content work well in conversational AI contexts?>,
    "instructionFollowingScore": <0-100: Did it precisely match format, tone, and length requirements?>,
    "outputConsistencyScore": <0-100: Is voice, terminology, and quality consistent throughout?>
  },
  
  "contentQualityMetrics": {
    "originalityScore": <0-100: Unique insights? Not generic?>,
    "depthScore": <0-100: Comprehensive coverage?>,
    "engagementPotentialScore": <0-100: Shareable? Hook in first 100 words?>,
    "freshnessScore": <0-100: Trending topics? Current data?>
  },
  
  "readabilityMetrics": {
    "fleschReadingEase": <0-100: Calculate actual Flesch score>,
    "fleschKincaidGrade": <US grade level: 1-16>,
    "averageSentenceLength": <average words per sentence>,
    "averageWordLength": <average characters per word>,
    "totalWords": <word count>,
    "totalSentences": <sentence count>
  },
  
  "contentAnalysis": {
    "headingsCount": <total headers H1+H2+H3>,
    "h2Count": <H2 count>,
    "h3Count": <H3 count>,
    "paragraphCount": <paragraph count>,
    "listCount": <list count>,
    "imageCount": <image references>,
    "internalLinksCount": <internal link count>,
    "externalLinksCount": <external link count>,
    "hasCTA": <true/false: clear call-to-action?>,
    "contentDepth": <"basic" | "standard" | "comprehensive" | "expert">
  },
  
  "keywordAnalysis": {
    "primaryKeyword": "<main keyword found in content>",
    "secondaryKeywords": ["<keyword2>", "<keyword3>"],
    "semanticKeywords": ["<related1>", "<related2>"],
    "keywordDensity": <percentage, e.g., 1.5>,
    "lsiKeywords": ["<latent semantic terms>"]
  },
  
  "improvementSuggestions": [
    "<Specific, actionable SEO improvement based on actual content analysis>"
  ],
  "geoSuggestions": [
    "<Specific GEO optimization based on actual content>"
  ],
  "aeoSuggestions": [
    "<Specific AEO optimization based on actual content>"
  ],
  "aioSuggestions": [
    "<Specific AIO optimization based on actual content>"
  ]
}

SCORING GUIDELINES (be critical):
- 90-100: Exceptional, truly outstanding in every aspect
- 80-89: Very good, minor improvements possible
- 70-79: Good but needs several optimizations
- 60-69: Acceptable, significant issues
- Below 60: Major problems, needs revision

Return ONLY valid JSON. No markdown, no code blocks, no explanation.`;

    try {
        const completion = await groqChatCompletion({
            messages: [
                {
                    role: "system",
                    content: "You are a critical content analyst. You provide honest, accurate metrics. You never inflate scores. You analyze content methodically and provide specific, actionable feedback.",
                },
                {
                    role: "user",
                    content: validationPrompt,
                },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.3, // Lower temperature for more consistent, critical analysis
            max_tokens: 4096,
            response_format: { type: "json_object" },
        });

        const responseContent = getCompletionContent(completion);

        if (!responseContent) {
            console.warn("[AutoPost] Validation returned no response, using generation metrics");
            return generatedPost;
        }

        const validationResult = JSON.parse(responseContent);

        // Merge validation results with generated post
        return {
            ...generatedPost,
            // Use validated metrics if available, otherwise keep original
            seoMetrics: { ...generatedPost.seoMetrics, ...validationResult.seoMetrics },
            geoMetrics: { ...generatedPost.geoMetrics, ...validationResult.geoMetrics },
            aeoMetrics: { ...generatedPost.aeoMetrics, ...validationResult.aeoMetrics },
            aioMetrics: { ...generatedPost.aioMetrics, ...validationResult.aioMetrics },
            contentQualityMetrics: { ...generatedPost.contentQualityMetrics, ...validationResult.contentQualityMetrics },
            readabilityMetrics: { ...generatedPost.readabilityMetrics, ...validationResult.readabilityMetrics },
            contentAnalysis: { ...generatedPost.contentAnalysis, ...validationResult.contentAnalysis },
            keywordAnalysis: { ...generatedPost.keywordAnalysis, ...validationResult.keywordAnalysis },
            // Merge suggestions - add validation suggestions to existing ones
            improvementSuggestions: [
                ...(generatedPost.improvementSuggestions || []),
                ...(validationResult.improvementSuggestions || []),
            ],
            geoSuggestions: [
                ...(generatedPost.geoSuggestions || []),
                ...(validationResult.geoSuggestions || []),
            ],
            aeoSuggestions: [
                ...(generatedPost.aeoSuggestions || []),
                ...(validationResult.aeoSuggestions || []),
            ],
            aioSuggestions: [
                ...(generatedPost.aioSuggestions || []),
                ...(validationResult.aioSuggestions || []),
            ],
        };
    } catch (error) {
        console.error("[AutoPost] Validation error:", error);
        // Return original post if validation fails
        return generatedPost;
    }
};

// ========== PREVIEW GENERATION ==========

export const generatePostPreview = async (
    bio: BioEntity,
    config: Partial<AutoPostScheduleEntity>,
    bioSummary: BioSummary
): Promise<GeneratedPost> => {
    // Use the same generation logic but mark as preview
    const mockSchedule: AutoPostScheduleEntity = {
        ...config,
        id: "preview",
        bioId: bio.id,
        userId: "preview",
        isActive: false,
        frequency: "weekly",
        postsThisMonth: 0,
        currentMonth: null,
        bioSummary: bioSummary.summary,
        bioSummaryGeneratedAt: new Date(),
        nextPostDate: null,
        lastPostDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as AutoPostScheduleEntity;

    const generatedPost = await generateAutoPost(bio, mockSchedule, bioSummary, null);
    
    // Run validation to get accurate metrics
    return await validateContentAndCalculateMetrics(generatedPost, bio, mockSchedule, bioSummary);
};

// ========== POST IDEAS GENERATION ==========

export const generatePostIdeas = async (
    bioSummary: BioSummary,
    count: number = 5
): Promise<Array<{ title: string; angle: string; keywords: string[] }>> => {
    const prompt = `Generate ${count} strategic blog post ideas for a ${bioSummary.industry} professional.

PROFILE:
- Expertise: ${bioSummary.expertise.join(", ")}
- Target Audience: ${bioSummary.targetAudience}
- Tone: ${bioSummary.tone}
- Content Pillars: ${bioSummary.contentPillars.join(", ")}
- USPs: ${bioSummary.uniqueSellingPoints.join(", ")}

Generate ideas that:
1. Target specific SEO keywords
2. Answer real user questions (AEO optimized)
3. Showcase their unique expertise
4. Have viral/share potential
5. Align with their content pillars
6. Target voice search and featured snippets

Return as JSON array:
[
  {
    "title": "Compelling, SEO-optimized title with question format for AEO",
    "angle": "Unique angle/hook for this post with direct answer strategy",
    "keywords": ["primary", "secondary", "semantic"]
  }
]`;

    try {
        const completion = await groqChatCompletion({
            messages: [
                {
                    role: "system",
                    content: "You are a creative content strategist who specializes in high-performing blog post ideas optimized for SEO, GEO, and AEO.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.8,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        });

        const responseContent = getCompletionContent(completion);

        if (!responseContent) {
            return [];
        }

        const parsedResponse = JSON.parse(responseContent);

        if (Array.isArray(parsedResponse)) {
            return parsedResponse;
        }

        if (parsedResponse.ideas && Array.isArray(parsedResponse.ideas)) {
            return parsedResponse.ideas;
        }

        return [];
    } catch (error) {
        console.error("Error generating post ideas:", error);
        return [];
    }
};

// ========== UTILITY FUNCTIONS ==========

const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const sanitizeSlug = (slug: string): string => {
    return slug
        .toLowerCase()
        .trim()
        .replace(/^-+/, "")
        .replace(/-+$/, "")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");
};

// Calculate overall score from individual metrics
export const calculateOverallScore = (metrics: Partial<SEOMetrics & GEOMetrics & AEOMetrics>): number => {
    const scores = [
        metrics.seoScore,
        metrics.geoScore,
        metrics.aeoScore,
        metrics.contentStructureScore,
        metrics.entityRecognitionScore,
        metrics.answerRelevanceScore,
        metrics.readabilityScore,
    ].filter((s): s is number => typeof s === 'number');

    if (scores.length === 0) return 70;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

// Get score color for UI
export const getScoreColor = (score: number): string => {
    if (score >= 90) return "#22c55e"; // Green
    if (score >= 80) return "#84cc16"; // Lime
    if (score >= 70) return "#eab308"; // Yellow
    if (score >= 60) return "#f97316"; // Orange
    return "#ef4444"; // Red
};

// Get score label
export const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Work";
};

// Convert markdown to HTML for legacy support
export const markdownToHTML = (markdown: string): string => {
    return markdown
        // Headers
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
        // Bold and Italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Blockquote
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Horizontal rule
        .replace(/^\-\-\-/gim, '<hr>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n/gim, '<br>');
};


// ========== METADATA GENERATION ==========

export interface GeneratedMetadata {
    keywords: string[];
    tags: string[];
    targetAudience: string;
    suggestedTopics: string[];
    contentAngles: string[];
}

/**
 * Generate SEO keywords, tags, and target audience based on topics
 * This is called when user enters topics first
 */
export const generateMetadataFromTopics = async (
    topics: string,
    bioSummary: BioSummary,
    targetCountry?: string | null,
    language?: string | null
): Promise<GeneratedMetadata> => {
    const languageInstruction = language 
        ? `Generate all content in ${language}`
        : targetCountry 
            ? `Generate all content appropriate for ${targetCountry}`
            : "Generate content in the same language as the topics provided";

    const prompt = `Based on the following topics and bio information, generate SEO metadata.

TOPICS/THEMES PROVIDED BY USER:
${topics}

BIO INFORMATION:
- Industry: ${bioSummary.industry}
- Expertise: ${bioSummary.expertise.join(", ")}
- Content Pillars: ${bioSummary.contentPillars.join(", ")}
- Unique Selling Points: ${bioSummary.uniqueSellingPoints.join(", ")}
${targetCountry ? `- Target Country: ${targetCountry}` : ""}

${languageInstruction}

Generate a JSON object with the following structure:
{
  "keywords": ["10-15 SEO keywords related to the topics, ordered by relevance and search volume"],
  "tags": ["8-10 content tags/categories for organizing posts"],
  "targetAudience": "Detailed description of the ideal target audience for this content (2-3 sentences)",
  "suggestedTopics": ["5-7 specific blog post topics/angles based on the themes"],
  "contentAngles": ["3-5 unique content angles or perspectives to differentiate the content"]
}

GUIDELINES:
- Keywords should include a mix of head terms and long-tail keywords
- Tags should be broad enough for categorization but specific to the niche
- Target audience should include demographics, pain points, and goals
- Suggested topics should be actionable and specific
- Content angles should highlight unique perspectives
- ALL content must be in the same language as the topics provided

Return ONLY valid JSON.`;

    try {
        const completion = await groqChatCompletion({
            messages: [
                {
                    role: "system",
                    content: "You are an expert SEO specialist and content strategist. You generate precise, actionable metadata for blog content optimization.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.5,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        });

        const responseContent = getCompletionContent(completion);

        if (!responseContent) {
            throw new Error("No response from AI");
        }

        const parsedResponse = JSON.parse(responseContent);

        return {
            keywords: Array.isArray(parsedResponse.keywords) ? parsedResponse.keywords : [],
            tags: Array.isArray(parsedResponse.tags) ? parsedResponse.tags : [],
            targetAudience: parsedResponse.targetAudience || "",
            suggestedTopics: Array.isArray(parsedResponse.suggestedTopics) ? parsedResponse.suggestedTopics : [],
            contentAngles: Array.isArray(parsedResponse.contentAngles) ? parsedResponse.contentAngles : [],
        };
    } catch (error) {
        logger.error("[AutoPostAI] Error generating metadata:", error);
        // Return fallback metadata
        return {
            keywords: bioSummary.expertise.slice(0, 10),
            tags: bioSummary.contentPillars.slice(0, 8),
            targetAudience: bioSummary.targetAudience,
            suggestedTopics: bioSummary.contentPillars,
            contentAngles: ["Educational", "How-to guides", "Industry insights"],
        };
    }
};

// ========== TOON STATS EXPORT ==========

/**
 * Get TOON optimization statistics
 */
export function getTOONStats(): {
    enabled: boolean;
    estimatedSavings: string;
    description: string;
} {
    return {
        enabled: USE_TOON_OPTIMIZATION,
        estimatedSavings: '~40% token reduction vs JSON',
        description: 'TOON (Token-Oriented Object Notation) reduces token usage in LLM prompts'
    };
}

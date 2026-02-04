import Groq from "groq-sdk";
import { env } from "../config/env";
import { SiteAutoPostScheduleEntity } from "../database/entity/site-auto-post-schedule-entity";
import { logger } from "../shared/utils/logger";

const groq = new Groq({
    apiKey: env.GROQ_API_KEY,
});

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
}

const SYSTEM_PROMPT = `You are PortyoAI Site Blog Writer, an expert SEO content creator specializing in high-quality, engaging blog posts optimized for search engines and AI discovery.

=== CRITICAL RULES ===
- Respond ONLY with valid JSON. No markdown, no explanations, no text before or after.
- Content must be engaging, professional, and valuable to readers.
- Optimize for both human readers and search engines.

=== CONTENT REQUIREMENTS ===

TITLE:
- Compelling and click-worthy (50-60 characters ideal)
- Include primary keyword naturally
- Create curiosity or promise value

CONTENT STRUCTURE:
- Hook readers in the first paragraph
- Use H2 and H3 headings for structure
- Include bullet points and lists for scannability
- Write in the tone specified by the user
- Length: 800-2500 words depending on "postLength" setting

SEO OPTIMIZATION:
- Include primary keyword in first 100 words
- Use semantic keywords throughout
- Natural keyword density (don't stuff)
- Internal linking suggestions (mark as [LINK: anchor text])

BILINGUAL CONTENT (when bilingual=true):
- Generate content in both Portuguese (pt) and English (en)
- Maintain same quality and SEO optimization in both languages
- Adapt cultural references appropriately

=== RESPONSE FORMAT ===
{
  "title": "Main Title in requested language",
  "titleEn": "English title (if bilingual)",
  "content": "Full markdown content in requested language",
  "contentEn": "English content (if bilingual)",
  "keywords": "keyword1, keyword2, keyword3",
  "keywordsEn": "english, keywords, if bilingual",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "slug": "url-friendly-slug",
  "titleLength": 55,
  "metaDescriptionLength": 158,
  "wordCount": 1200,
  "seoScore": 85,
  "geoScore": 82,
  "aeoScore": 78,
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

export const generateSiteContentSummary = async (
    topics: string,
    targetAudience?: string | null,
    tone?: string
): Promise<SiteContentSummary> => {
    const prompt = `Analyze the following blog topics and create a content strategy summary:

Topics: ${topics}
Target Audience: ${targetAudience || "General audience"}
Tone: ${tone || "professional"}

Generate a JSON response with:
- summary: Brief description of the blog's focus (2-3 sentences)
- industry: Primary industry/category
- expertise: Array of 5-7 key expertise areas
- tone: Suggested writing tone
- targetAudience: Refined target audience description
- contentPillars: Array of 4-6 content pillars/themes

Respond ONLY with valid JSON.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a content strategy expert." },
                { role: "user", content: prompt },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.6,
            max_tokens: 1500,
            response_format: { type: "json_object" },
        });

        const response = JSON.parse(completion.choices[0]?.message?.content || "{}");
        
        return {
            summary: response.summary || "Professional blog covering industry insights and expertise.",
            industry: response.industry || "General",
            expertise: response.expertise || [],
            tone: response.tone || tone || "professional",
            targetAudience: response.targetAudience || targetAudience || "General audience",
            contentPillars: response.contentPillars || [],
        };
    } catch (error) {
        logger.error("[SiteAutoPost] Error generating content summary:", error);
        return {
            summary: "Professional blog covering industry insights.",
            industry: "General",
            expertise: [],
            tone: tone || "professional",
            targetAudience: targetAudience || "General audience",
            contentPillars: [],
        };
    }
};

export const generateSiteAutoPost = async (
    schedule: SiteAutoPostScheduleEntity,
    contentSummary: SiteContentSummary,
    previousSuggestions: { seo: string[]; geo: string[]; aeo: string[] } | null
): Promise<GeneratedSitePost> => {
    const wordCountTarget = schedule.postLength === "short" ? 800 : 
                           schedule.postLength === "long" ? 2500 : 1500;

    let prompt = `Create a high-quality blog post with the following parameters:

=== BLOG FOCUS ===
Summary: ${contentSummary.summary}
Industry: ${contentSummary.industry}
Expertise: ${contentSummary.expertise.join(", ")}
Content Pillars: ${contentSummary.contentPillars.join(", ")}

=== POST CONFIGURATION ===
Topics/Themes: ${schedule.topics || "General industry insights"}
Target Audience: ${contentSummary.targetAudience}
Tone: ${schedule.tone || "professional"}
Post Length: Approximately ${wordCountTarget} words
Language: ${schedule.language || "pt"}
Bilingual: ${schedule.bilingual ? "Yes - create both PT and EN versions" : "No - single language only"}

=== PREVIOUS IMPROVEMENT SUGGESTIONS ===
`;

    if (previousSuggestions) {
        if (previousSuggestions.seo.length > 0) {
            prompt += `SEO: ${previousSuggestions.seo.join("; ")}\n`;
        }
        if (previousSuggestions.geo.length > 0) {
            prompt += `GEO: ${previousSuggestions.geo.join("; ")}\n`;
        }
        if (previousSuggestions.aeo.length > 0) {
            prompt += `AEO: ${previousSuggestions.aeo.join("; ")}\n`;
        }
    } else {
        prompt += "None - this is the first post.\n";
    }

    prompt += `
=== CONTENT REQUIREMENTS ===
1. Create an engaging, valuable blog post
2. Use proper markdown formatting (# ## ###, - lists, etc.)
3. Include a compelling introduction and conclusion
4. Optimize for SEO with natural keyword usage
5. ${schedule.bilingual ? "Provide high-quality content in BOTH Portuguese and English" : "Write in the specified language only"}
6. Calculate realistic scores based on content quality
7. Suggest 2-3 specific improvements for the next post

Respond ONLY with the JSON object in the specified format.`;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || "{}");

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
    };
};

export const generateSitePostPreview = async (
    schedule: Partial<SiteAutoPostScheduleEntity>,
    contentSummary: SiteContentSummary
): Promise<GeneratedSitePost> => {
    return generateSiteAutoPost(
        schedule as SiteAutoPostScheduleEntity,
        contentSummary,
        null
    );
};

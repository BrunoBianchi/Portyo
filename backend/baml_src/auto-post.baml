// Auto Post Generation - BAML Schema
// Structured prompts for generating SEO/GEO/AEO optimized blog posts

class SEOMetrics {
  seoScore int @description("Overall SEO score 0-100")
  titleOptimizationScore int
  metaDescriptionScore int
  contentStructureScore int
  keywordDensityScore int
  readabilityScore int
  internalLinkingScore int
}

class GEOMetrics {
  geoScore int @description("Overall GEO score 0-100")
  entityRecognitionScore int
  answerOptimizationScore int
  structuredDataScore int
  authoritySignalsScore int
  contextClarityScore int
  conversationalValueScore int
  featuredSnippetScore int
}

class AEOMetrics {
  aeoScore int @description("Overall AEO score 0-100")
  answerRelevanceScore int
  directAnswerScore int
  questionOptimizationScore int
  voiceSearchScore int
  clarityScore int
  concisenessScore int
  factualAccuracyScore int
}

class AIOMetrics {
  aioScore int @description("Overall AIO score 0-100")
  promptEfficiencyScore int
  contextAdherenceScore int
  hallucinationResistanceScore int
  citationQualityScore int
  multiTurnOptimizationScore int
  instructionFollowingScore int
  outputConsistencyScore int
}

class ContentQualityMetrics {
  originalityScore int
  depthScore int
  engagementPotentialScore int
  freshnessScore int
}

class KeywordAnalysis {
  primaryKeyword string
  secondaryKeywords string[]
  semanticKeywords string[]
  keywordDensity float
  lsiKeywords string[]
}

class ReadabilityMetrics {
  fleschReadingEase float
  fleschKincaidGrade float
  averageSentenceLength float
  averageWordLength float
  totalWords int
  totalSentences int
}

class ContentAnalysis {
  headingsCount int
  h2Count int
  h3Count int
  paragraphCount int
  listCount int
  imageCount int
  internalLinksCount int
  externalLinksCount int
  hasCTA boolean
  contentDepth "basic" | "standard" | "comprehensive" | "expert"
}

class EntityAnalysis {
  mainEntities string[]
  relatedEntities string[]
  entitySalience map<string, float>
  topicCategories string[]
}

class AIOptimization {
  answerTargets string[]
  questionCoverage string[]
  snippetCandidates string[]
  voiceSearchOptimized boolean
  chatGptFriendly boolean
}

class GeneratedPost {
  title string @description("Optimized title 50-60 chars")
  slug string @description("URL-friendly slug with keywords")
  content string @description("Full content in MARKDOWN format")
  keywords string @description("Primary, secondary, semantic keywords for SEO")
  metaDescription string @description("Compelling meta description 150-160 chars")
  titleLength int
  metaDescriptionLength int
  
  seoMetrics SEOMetrics
  geoMetrics GEOMetrics
  aeoMetrics AEOMetrics
  aioMetrics AIOMetrics
  contentQualityMetrics ContentQualityMetrics
  
  keywordAnalysis KeywordAnalysis
  readabilityMetrics ReadabilityMetrics
  contentAnalysis ContentAnalysis
  entityAnalysis EntityAnalysis
  aiOptimization AIOptimization
  
  improvementSuggestions string[]
  geoSuggestions string[]
  aeoSuggestions string[]
  aioSuggestions string[]
}

class PostGenerationInput {
  authorName string
  bioSummary string
  industry string
  expertise string[]
  uniqueSellingPoints string[]
  targetAudience string
  contentPillars string[]
  topics string
  keywords string
  tone string
  length string
  language string
  targetCountry string?
}

function GenerateAutoPost(input: PostGenerationInput) -> GeneratedPost {
  client GPT4
  
  prompt #"
    Create an EXCEPTIONAL, publication-ready blog post optimized for Search Engines (SEO), Generative AI (GEO), and Answer Engines (AEO).

    === AUTHOR PROFILE ===
    Name: {{ input.authorName }}
    Bio: {{ input.bioSummary }}
    Industry: {{ input.industry }}
    Expertise: {{ input.expertise }}
    Unique Selling Points: {{ input.uniqueSellingPoints }}
    Target Audience: {{ input.targetAudience }}
    Content Pillars: {{ input.contentPillars }}

    === POST REQUIREMENTS ===
    Topic Focus: {{ input.topics }}
    Target Keywords: {{ input.keywords }}
    Tone of Voice: {{ input.tone }}
    Length: {{ input.length }}
    Language: {{ input.language }}
    Target Country: {{ input.targetCountry }}

    === CRITICAL REQUIREMENTS ===
    1. Title: 50-60 chars, keyword-rich, click-worthy
    2. Meta Description: 150-160 chars, compelling CTA
    3. Content: Use proper Markdown format
    4. AEO: Include question-based headers (60%+ as questions)
    5. GEO: Clear entities, structured data ready, E-E-A-T signals
    6. AIO: Clear structure, verifiable facts, consistent voice

    Return a complete GeneratedPost object with all metrics.
  "#
}

function ValidateContent(post: GeneratedPost, bioSummary: string, targetCountry: string?) -> GeneratedPost {
  client GPT4
  
  prompt #"
    You are an expert content analyzer. CRITICALLY ANALYZE this blog post and calculate PRECISE, HONEST metrics.

    === CONTENT ===
    Title: {{ post.title }}
    Meta Description: {{ post.metaDescription }}
    Content: {{ post.content }}

    === CONTEXT ===
    Bio Summary: {{ bioSummary }}
    Target Country: {{ targetCountry }}

    === TASK ===
    Analyze critically and return precise scores (0-100).
    BE HONEST - good post = 75-85, exceptional = 90+
    
    Return a complete GeneratedPost with validated metrics and specific improvement suggestions.
  "#
}

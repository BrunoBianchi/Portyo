// Bio Summary Generation - BAML Schema
// This file defines the structured prompt for generating bio summaries

class BioSummary {
  summary string @description("A compelling 2-3 sentence summary capturing the essence, value proposition, and expertise")
  industry string @description("Primary industry with niche specification (e.g., 'SaaS Content Marketing', 'Portrait Photography')")
  expertise string[] @description("5-7 specific skills/areas of deep expertise")
  tone string @description("Primary communication tone (professional, casual, authoritative, creative, friendly, technical)")
  targetAudience string @description("Detailed audience persona - who they serve, pain points, goals")
  uniqueSellingPoints string[] @description("3-5 unique differentiators that set them apart")
  contentPillars string[] @description("4-6 main content themes/topics they should focus on")
}

class BioInput {
  displayName string @description("The display name from the bio")
  username string @description("The username/suffix from the bio")
  description string @description("The bio description")
  seoDescription string @description("The SEO description")
  blocksContent string @description("JSON string of the bio blocks content")
}

function GenerateBioSummary(input: BioInput) -> BioSummary {
  client GPT4
  
  prompt #"
    Analyze this bio/portfolio page and create a comprehensive, strategic summary for AI content generation.

    BIO INFORMATION:
    - Display Name: {{ input.displayName }}
    - Username: {{ input.username }}
    - Description: {{ input.description }}
    - SEO Description: {{ input.seoDescription }}
    - Page Blocks/Content: {{ input.blocksContent }}

    Generate a detailed {{ BioSummary }} object.

    GUIDELINES:
    - Be specific and actionable
    - Identify content opportunities
    - Understand their unique angle
    - Consider SEO/GEO/AEO implications
    - Return ONLY valid JSON matching the schema
  "#
}

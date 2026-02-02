// Resume Parser - BAML Schema
// Extract work experiences from resume text

class WorkExperience {
  id string @description("Generated unique ID")
  company string @description("Company name")
  role string @description("Job title/role")
  period string @description("Start Date - End Date (e.g. Jan 2020 - Present)")
  location string @description("City, Country")
  description string @description("Brief description of responsibilities (max 200 chars)")
}

function ExtractExperiencesFromResume(resumeText: string) -> WorkExperience[] {
  client GPT4oMini
  
  prompt #"
    Extract work experience from this resume text:

    {{ resumeText }}

    Rules:
    - Extract all work experiences found
    - Generate a random ID for each experience
    - Keep descriptions concise (max 200 chars)
    - CRITICAL: Detect the language of the resume text. Generate role, description, 
      period, and location in the SAME LANGUAGE as the resume. Do NOT translate.

    Return an array of WorkExperience objects.
  "#
}

// Bio Generation - BAML Schema
// Structured prompts for generating bio/portfolio content blocks

class BioBlock {
  id string
  type string
  // Additional fields based on block type
  title string?
  body string?
  align "left" | "center" | "right"?
  href string?
  buttonStyle string?
  accent string?
  textColor string?
  imageUrl string?
  socials map<string, string>?
}

class BioSettings {
  bgType "color" | "gradient" | "dots" | "grid" | "waves" | "mesh" | "particles" | "noise" | "abstract"
  bgColor string
  bgSecondaryColor string?
  font string
  usernameColor string
  cardStyle "none" | "flat" | "shadow" | "outline" | "glass"?
  cardBackgroundColor string?
}

class BioGenerationResult {
  settings BioSettings
  blocks BioBlock[]
}

class OnboardingInput {
  aboutYou string
  hasGraduation boolean
  degree string?
  profession string
  skills string[]
  goals string[]
  resumeText string?
}

function GenerateBioFromOnboarding(input: OnboardingInput) -> BioGenerationResult {
  client GPT4oMini
  
  prompt #"
    Create bio/portfolio blocks for a person with these characteristics:

    About: {{ input.aboutYou }}
    Education: {{ input.hasGraduation }} {{ input.degree }}
    Profession: {{ input.profession }}
    Skills: {{ input.skills }}
    Goals: {{ input.goals }}
    Resume: {{ input.resumeText }}

    Available block types:
    - heading: title, body (subtitle), align, fontSize
    - text: body (paragraph), align
    - button: title, href, buttonStyle (solid/outline/gradient), accent
    - button_grid: grid of buttons
    - image: mediaUrl, align, imageStyle
    - socials: social media links
    - divider: visual separator
    - portfolio: portfolio items
    - form: contact form

    Generate appropriate blocks and settings. Choose a theme that fits the profession.
    Limit to 5-8 blocks.

    Return a BioGenerationResult with settings and blocks array.
  "#
}

function GenerateContentFromPrompt(prompt: string) -> BioGenerationResult {
  client GPT4oMini
  
  prompt #"
    You are PortyoAI, an AI assistant that helps customize bio/portfolio pages.

    User request: {{ prompt }}

    CRITICAL - Dark/Light Theme:
    - Dark Theme: bgColor dark, textColor light, accent mid-tone
    - Light Theme: bgColor light, textColor dark

    Available blocks: heading, text, button, button_grid, image, socials, 
    divider, portfolio, form, calendar, map, event, instagram, youtube, spotify,
    product, featured, affiliate, qrcode

    Return BioGenerationResult with:
    - settings: bgType, bgColor, font, usernameColor, cardStyle
    - blocks: array of blocks with appropriate fields
    - Use replaceBlocks: true only if user wants to replace everything
  "#
}

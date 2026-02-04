import Groq from "groq-sdk";
import { env } from "../config/env";

// Initialize Groq client
const groq = new Groq({
    apiKey: env.GROQ_API_KEY,
});

export interface OnboardingAnswers {
    theme?: {
        name?: string;
        styles?: {
            bgType?: string;
            bgColor?: string;
            bgSecondaryColor?: string;
            cardStyle?: string;
            cardBackgroundColor?: string;
            cardBorderColor?: string;
            cardBorderWidth?: number;
            cardBorderRadius?: number;
            cardShadow?: string;
            cardPadding?: number;
            cardOpacity?: number;
            cardBlur?: number;
            usernameColor?: string;
            font?: string;
            maxWidth?: number;
            imageStyle?: string;
            enableParallax?: boolean;
            parallaxIntensity?: number;
            parallaxDepth?: number;
            floatingElements?: boolean;
            floatingElementsType?: string;
            floatingElementsColor?: string;
            floatingElementsDensity?: number;
            floatingElementsSize?: number;
            floatingElementsSpeed?: number;
            floatingElementsOpacity?: number;
            floatingElementsBlur?: number;
        };
    } | null;
    aboutYou: string;
    education: {
        hasGraduation: boolean;
        universityName?: string;
        courseName?: string;
        degree?: string;
    };
    profession: string;
    skills: string[];
    goals: string[];
    resumeText?: string;
}

export interface BioBlock {
    id: string;
    type: string;
    [key: string]: any;
}

const generateBlockId = (): string => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const SYSTEM_PROMPT = `You are PortyoAI, an elite AI architect specializing in creating premium, conversion-optimized portfolio and bio pages. You craft professional digital identities that captivate visitors and achieve business goals.

=== CRITICAL RULES ===
- Respond ONLY with valid JSON. No markdown, no explanations, no text before or after.
- All content must be in the SAME LANGUAGE as the user's input.
- Create content that is CONCISE, SCANNABLE, and conversion-focused.
- KEEP IT SHORT: max 2-3 sentences per text block (150-200 chars).
- AVOID long paragraphs - they look terrible on mobile.
- NO bullet points (•) inside text blocks.
- Use SHORT sentences - one idea per sentence.

=== AVAILABLE BLOCK TYPES ===

CORE CONTENT:
1. "heading" - Main title
    Fields: title, body (optional), align ("left"|"center"|"right"), fontSize, fontWeight, textColor (hex)
2. "text" - Paragraph
    Fields: body, align, textColor (hex)
3. "button" - CTA link
    Fields: title, href, buttonStyle ("solid"|"outline"|"gradient"|"glass"), align, accent (hex), textColor (hex), buttonShape ("pill"|"rounded"|"square")
4. "divider" - Separator
    Fields: dividerStyle ("line"|"dots"|"space")
5. "button_grid" - Grid of buttons
    Fields: gridItems (array of {id, title, url, icon})

MEDIA:
6. "image" - Image
    Fields: mediaUrl, align, imageStyle ("default"|"circle"|"rounded")
7. "video" - Video
    Fields: mediaUrl
8. "youtube" - YouTube
    Fields: youtubeUrl, youtubeDisplayType ("grid"|"list")
9. "spotify" - Spotify
    Fields: spotifyUrl, spotifyCompact (boolean)
10. "instagram" - Instagram
    Fields: instagramUsername, instagramDisplayType ("grid"|"list")

SOCIAL / CONTACT:
11. "socials" - Social links
     Fields: socials ({instagram, linkedin, github, twitter, email, website, youtube, tiktok, whatsapp}), socialsLayout ("row"|"column")
12. "whatsapp" - WhatsApp CTA
     Fields: whatsappNumber, whatsappMessage, whatsappStyle, whatsappShape, accent, textColor

COMMERCE:
13. "product" - Product list
     Fields: products (array), productLayout ("grid"|"list"|"carousel"), productCardStyle ("default"|"minimal")
14. "featured" - Featured item
     Fields: featuredTitle, featuredDescription, featuredPrice, featuredUrl, featuredImage
15. "affiliate" - Affiliate/coupon
     Fields: affiliateTitle, affiliateCode, affiliateUrl, affiliateImage

GROWTH / UTILITIES:
16. "form" - Lead capture
     Fields: formId, formBackgroundColor, formTextColor
17. "portfolio" - Portfolio
     Fields: portfolioTitle
18. "experience" - Experience
     Fields: experienceTitle, experiences (array of {role, company, period, location, description})
19. "blog" - Blog feed
     Fields: blogLayout ("carousel"|"list"|"grid"), blogPostCount
20. "calendar" - Booking calendar
     Fields: calendarTitle, calendarUrl
21. "map" - Location
     Fields: mapTitle, mapAddress
22. "event" - Event CTA
     Fields: eventTitle, eventDate, eventButtonText, eventButtonUrl
23. "tour" - Tour dates
     Fields: tourTitle, tours (array)
24. "qrcode" - QR Code
     Fields: qrCodeValue, qrCodeLayout ("single"|"multiple"|"grid")
25. "marketing" - Marketing slot
     Fields: marketingId

=== CONTENT GENERATION STRATEGY ===

STRUCTURE (Create 5-7 blocks maximum):
1. HEADING: Name + very short tagline (max 5-7 words)
   Example: "João Silva" + "Desenvolvedor Full Stack"

2. SHORT BIO: 1-2 sentences about what they do
   Example: "Ajudo empresas a construir produtos digitais escaláveis. Especialista em React e Node.js."

3. [Optional] SKILLS: button_grid with 4-6 skills (1-2 words each)

4. DIVIDER: Add space between sections

5. CTA BUTTON: One clear call-to-action (2-4 words)
   Examples: "Fale Comigo", "Agendar Call", "Ver Projetos"

6. SOCIAL LINKS: socials block

=== PAGE SETTINGS ===
Generate optimized "settings" object:
- bgType: Choose based on profession vibe ("color"|"gradient"|"mesh-gradient"|"noise")
- bgColor: Harmonizes with selected theme or professional standard
- bgSecondaryColor: Complementary accent
- font: Professional typography ("Inter"|"Space Grotesk"|"Plus Jakarta Sans"|"DM Sans")
- usernameColor: High contrast against background
- cardStyle: "solid"|"frosted"|"none" based on modern trends
- cardBackgroundColor: Ensure readability
- imageStyle: "circle" for personal brands, "rounded" for corporate

=== THEME-AWARE DESIGN ===
If a theme is selected, respect its:
- Color palette (adapt content colors for contrast)
- Typography style
- Overall aesthetic (minimal, bold, elegant, etc.)
- Card and layout preferences

=== RESPONSE FORMAT ===
{
  "settings": {
    "bgType": "...",
    "bgColor": "#...",
    "bgSecondaryColor": "#...",
    "font": "...",
    "usernameColor": "#...",
    "cardStyle": "...",
    "cardBackgroundColor": "#...",
    "imageStyle": "..."
  },
  "blocks": [
    { "type": "heading", "id": "...", "title": "...", "body": "...", "align": "center" },
    { "type": "text", "id": "...", "body": "...", "align": "center" },
    ...
  ]
}`;

const buildUserPrompt = (answers: OnboardingAnswers): string => {
    let prompt = `Create a professional, conversion-optimized bio page for the following person:\n\n`;
    
    prompt += `=== PROFESSIONAL PROFILE ===\n`;
    prompt += `About: ${answers.aboutYou}\n\n`;
    
    prompt += `Profession: ${answers.profession}\n\n`;
    
    if (answers.education.hasGraduation) {
        prompt += `Education: `;
        if (answers.education.courseName) {
            prompt += `Graduated in ${answers.education.courseName}`;
            if (answers.education.universityName) {
                prompt += ` from ${answers.education.universityName}`;
            }
        } else if (answers.education.degree) {
            prompt += `Holds degree in ${answers.education.degree}`;
        } else {
            prompt += `Has formal education`;
        }
        prompt += `\n\n`;
    } else {
        prompt += `Education: Self-taught / No formal degree\n\n`;
    }
    
    if (answers.skills.length > 0) {
        prompt += `Key Skills: ${answers.skills.join(", ")}\n\n`;
    }
    
    if (answers.goals.length > 0) {
        prompt += `Primary Goals: ${answers.goals.join(", ")}\n\n`;
    }
    
    if (answers.resumeText) {
        prompt += `=== RESUME/CV CONTENT ===\n${answers.resumeText}\n\n`;
        prompt += `Use resume information to enhance the bio, prioritizing the specific profile above.\n\n`;
    }
    
    if (answers.theme?.name) {
        prompt += `=== SELECTED THEME ===\n`;
        prompt += `Theme: ${answers.theme.name}\n`;
        if (answers.theme.styles) {
            prompt += `Background: ${answers.theme.styles.bgType}\n`;
            prompt += `Style: ${answers.theme.styles.cardStyle}\n`;
            prompt += `Typography: ${answers.theme.styles.font}\n`;
        }
        prompt += `\n`;
    }
    
    prompt += `=== CRITICAL INSTRUCTIONS ===\n`;
    prompt += `1. KEEP ALL CONTENT SHORT AND CONCISE - users scan, they don't read long text\n`;
    prompt += `2. Text blocks: MAXIMUM 2-3 short sentences (150-200 characters total)\n`;
    prompt += `3. NO bullet points with • in text blocks\n`;
    prompt += `4. NO generic phrases like "apaixonado por", "dedicado a", "comprometido com"\n`;
    prompt += `5. Use SPECIFIC language about what they DO and the RESULTS they deliver\n`;
    prompt += `6. Focus on OUTCOMES, not just descriptions\n`;
    prompt += `7. Create 5-7 blocks maximum\n`;
    prompt += `8. Include dividers between sections for visual breathing room\n`;
    prompt += `9. Respond ONLY with the JSON object. No additional text.\n`;
    
    return prompt;
};

const extractThemeSettings = (answers: OnboardingAnswers): Record<string, any> | null => {
    const themeStyles = answers.theme?.styles;
    if (!themeStyles) return null;

    const themeSettings: Record<string, any> = {
        bgType: themeStyles.bgType,
        bgColor: themeStyles.bgColor,
        bgSecondaryColor: themeStyles.bgSecondaryColor,
        cardStyle: themeStyles.cardStyle,
        cardBackgroundColor: themeStyles.cardBackgroundColor,
        cardBorderColor: themeStyles.cardBorderColor,
        cardBorderWidth: themeStyles.cardBorderWidth,
        cardBorderRadius: themeStyles.cardBorderRadius,
        cardShadow: themeStyles.cardShadow,
        cardPadding: themeStyles.cardPadding,
        cardOpacity: themeStyles.cardOpacity,
        cardBlur: themeStyles.cardBlur,
        usernameColor: themeStyles.usernameColor,
        font: themeStyles.font,
        maxWidth: themeStyles.maxWidth,
        imageStyle: themeStyles.imageStyle,
        enableParallax: themeStyles.enableParallax,
        parallaxIntensity: themeStyles.parallaxIntensity,
        parallaxDepth: themeStyles.parallaxDepth,
        floatingElements: themeStyles.floatingElements,
        floatingElementsType: themeStyles.floatingElementsType,
        floatingElementsColor: themeStyles.floatingElementsColor,
        floatingElementsDensity: themeStyles.floatingElementsDensity,
        floatingElementsSize: themeStyles.floatingElementsSize,
        floatingElementsSpeed: themeStyles.floatingElementsSpeed,
        floatingElementsOpacity: themeStyles.floatingElementsOpacity,
        floatingElementsBlur: themeStyles.floatingElementsBlur,
    };

    return themeSettings;
};

export const generateBioFromOnboarding = async (answers: OnboardingAnswers): Promise<{ blocks: BioBlock[], settings: any }> => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: buildUserPrompt(answers),
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 4096,
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0]?.message?.content;
        
        if (!responseContent) {
            throw new Error("No response from AI");
        }

        // Parse the JSON response
        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(responseContent);
        } catch (parseError) {
            console.error("Failed to parse AI response:", responseContent);
            throw new Error("Invalid JSON response from AI");
        }

        let blocks: any[] = [];
        let settings: any = {};

        // Handle new format with "blocks" and "settings"
        if (parsedResponse.blocks && Array.isArray(parsedResponse.blocks)) {
            blocks = parsedResponse.blocks;
            settings = parsedResponse.settings || {};
        } else if (Array.isArray(parsedResponse)) {
            // Fallback for array only response (old prompt style)
            blocks = parsedResponse;
            settings = {
                bgType: "color",
                bgColor: "#f8fafc",
                font: "Inter",
            };
        } else {
            console.error("Unexpected response format:", parsedResponse);
            throw new Error("Unexpected response format from AI");
        }

        const themeSettings = extractThemeSettings(answers);
        if (themeSettings) {
            settings = { ...settings, ...themeSettings };
        }

        // Add IDs to each block
        const blocksWithIds: BioBlock[] = blocks.map((block: any) => ({
            ...block,
            id: generateBlockId(),
            // Ensure ID on grid items too if button_grid
            ...(block.type === 'button_grid' && block.gridItems ? {
                gridItems: block.gridItems.map((item: any) => ({ ...item, id: generateBlockId() }))
            } : {})
        }));

        return { blocks: blocksWithIds, settings };
    } catch (error) {
        console.error("Error generating bio from AI:", error);
        throw error;
    }
};

// Default blocks if AI generation fails
export const getDefaultBlocks = (name: string): { blocks: BioBlock[], settings: any } => {
    return {
        blocks: [
            {
                id: generateBlockId(),
                type: "heading",
                title: name || "Welcome",
                body: "Professional Portfolio",
                align: "center",
            },
            {
                id: generateBlockId(),
                type: "text",
                body: "Welcome to my professional page. I'm excited to share my work and connect with you.",
                align: "center",
            },
            {
                id: generateBlockId(),
                type: "button",
                title: "Get in Touch",
                href: "mailto:contact@example.com",
                buttonStyle: "solid",
                align: "center",
            },
        ],
        settings: {
            bgType: "color",
            bgColor: "#0a0a0f",
            font: "Inter",
            usernameColor: "#ffffff",
        }
    };
};

export interface AIGenerationResult {
    blocks: BioBlock[];
    settings: {
        bgType?: string;
        bgColor?: string;
        bgSecondaryColor?: string;
        cardStyle?: string;
        cardBackgroundColor?: string;
        usernameColor?: string;
        font?: string;
        imageStyle?: string;
    };
    replaceBlocks: boolean;
    globalBlockStyles?: {
        textColor?: string;
        accent?: string;
        buttonStyle?: string;
        formBackgroundColor?: string;
        formTextColor?: string;
        buttonShadowColor?: string;
    };
}

const CONTENT_GENERATION_PROMPT = `You are PortyoAI, an advanced AI assistant that helps users customize their bio/portfolio page.
Based on the user's request, you can generate content blocks, change page settings, OR update styles of all existing blocks.

IMPORTANT: You MUST respond ONLY with valid JSON, no additional text.

CRITICAL - DARK/LIGHT THEME & CONTRAST:
- When user asks for "Dark Theme/Mode":
  1. Set settings.bgColor to a dark color.
  2. YOU MUST USE "globalBlockStyles" to update ALL text to light colors.
     "globalBlockStyles": { "textColor": "#ffffff", "accent": "#YOUR_CHOICE", "formTextColor": "#ffffff" }
- When user asks for "Light Theme/Mode":
  1. Set settings.bgColor to a light color.
  2. YOU MUST USE "globalBlockStyles" to update ALL text to dark colors.
     "globalBlockStyles": { "textColor": "#000000", "accent": "#YOUR_CHOICE" }

CRITICAL - DARK THEME LOGIC:
- When user asks for "Dark Theme" or "Dark Mode":
  1. Background: Dark (e.g., #0a0a0f, #000000, #0f172a)
  2. Text: Light (e.g., #f8fafc, #ffffff)
  3. Buttons/Accents: MID-TONE colors (e.g., #6366f1, #22c55e, #a855f7) - vibrant against dark background

=== ALL AVAILABLE BLOCK TYPES ===

CONTENT BLOCKS:
1. "heading" - Title block
   Fields: title (string), body (optional subtitle string), align ("left"|"center"|"right"), textColor (hex color)

2. "text" - Text paragraph
   Fields: body (string with the text content), textColor (hex color)

3. "button" - Link button
   Fields: title (string), href (URL string), buttonStyle ("solid"|"outline"|"gradient"), accent (bg hex color), textColor (text hex color)

4. "button_grid" - Grid of multiple buttons
   Fields: buttons (array of {title, href})

5. "image" - Image block
   Fields: imageUrl (URL string), imageCaption (optional string)

6. "video" - YouTube/Vimeo embed
   Fields: videoUrl (URL string)

7. "divider" - Visual separator
   Fields: dividerStyle ("line"|"dots"|"space")

8. "qrcode" - QR Code block
   Fields: qrCodeValue (URL string), qrCodeLayout ("single"|"grid")

9. "form" - Contact/Lead form
   Fields: formTitle (string), formFields (array of field names), formBackgroundColor (hex), formTextColor (hex)

10. "portfolio" - Portfolio gallery
    Fields: portfolioTitle (string), portfolioItems (array of {title, imageUrl, description})

11. "map" - Location map
    Fields: mapAddress (string address), mapZoom (number 1-20)

12. "event" - Event countdown
    Fields: eventTitle (string), eventDate (ISO date string), eventButtonText (string), eventButtonUrl (URL)

SOCIAL BLOCKS:
13. "socials" - Social media links
    Fields: socials (object with keys: instagram, linkedin, github, twitter, tiktok, facebook, youtube, spotify, email, website - all optional URL strings)

14. "instagram" - Instagram feed embed
    Fields: instagramUsername (string without @)

15. "youtube" - YouTube channel feed
    Fields: youtubeUrl (channel URL string)

16. "spotify" - Spotify player embed
    Fields: spotifyUrl (track/album/playlist URL)

SHOP BLOCKS:
17. "product" - Product listing
    Fields: productTitle (string)

18. "featured" - Featured product
    Fields: featuredTitle (string), featuredDescription (string), featuredPrice (string), featuredButtonText (string)

19. "affiliate" - Affiliate/Discount code
    Fields: affiliateCode (string), affiliateDescription (string)

PRO BLOCKS (only for Pro users):
20. "calendar" - Booking calendar
    Fields: calendarTitle (string)

21. "tour" - Tour dates for artists
    Fields: tourTitle (string), tours (array of {date, location, ticketUrl})

22. "blog" - Blog section
    Fields: blogLayout ("carousel"|"grid"|"list")

=== PAGE SETTINGS ===
- bgType: "color" | "gradient" | "dots" | "grid" | "waves" | "mesh" | "particles" | "noise" | "abstract"
- bgColor: hex color (e.g., "#0a0a0f")
- bgSecondaryColor: hex for patterns (e.g., "#1a1a2e")
- cardStyle: "none" | "solid" | "frosted"
- cardBackgroundColor: hex color
- usernameColor: hex color for name text
- font: "Inter" | "Space Grotesk" | "DM Sans" | "Plus Jakarta Sans"
- imageStyle: "circle" | "rounded" | "square"

=== RESPONSE FORMAT ===
{
  "blocks": [...],
  "settings": {...},
  "globalBlockStyles": { ... },
  "replaceBlocks": true/false
}

=== EXAMPLES ===
- "Dark theme": {"blocks": [], "settings": {"bgType": "color", "bgColor": "#0a0a0f", "usernameColor": "#ffffff"}, "globalBlockStyles": {"textColor": "#ffffff", "accent": "#6366f1"}, "replaceBlocks": false}
- "Add headline": {"blocks": [{"type": "heading", "title": "Hello", "textColor": "#ffffff"}], "settings": {}, "replaceBlocks": false}
- "Make bio for lawyer": {"blocks": [{"type": "heading", "title": "John Doe", "body": "Attorney at Law", "textColor": "#ffffff"}, {"type": "text", "body": "Specializing in corporate law.", "textColor": "#E0E0E0"}, {"type": "button", "title": "Consultation", "href": "https://", "buttonStyle": "solid", "accent": "#C0A062", "textColor": "#FFFFFF"}], "settings": {"bgType": "color", "bgColor": "#0a0a0f", "usernameColor": "#C0A062", "cardStyle": "solid", "cardBackgroundColor": "#1a1a1a"}, "replaceBlocks": true}

Be creative and professional!`;


export const generateContentFromPrompt = async (prompt: string): Promise<AIGenerationResult> => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: CONTENT_GENERATION_PROMPT },
                { role: "user", content: prompt },
            ],
            model: env.GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        });

        const responseContent = chatCompletion.choices[0]?.message?.content?.trim() || "{}";
        
        let parsedResponse: any;
        try {
            parsedResponse = JSON.parse(responseContent);
        } catch (parseError) {
            console.error("Failed to parse AI response:", responseContent);
            throw new Error("Invalid JSON response from AI");
        }

        // Extract blocks
        let blocks: any[] = [];
        if (Array.isArray(parsedResponse.blocks)) {
            blocks = parsedResponse.blocks;
        }

        // Add IDs to blocks
        const blocksWithIds: BioBlock[] = blocks.map((block: any) => ({
            ...block,
            id: generateBlockId(),
        }));

        // Extract settings
        const settings = parsedResponse.settings || {};
        
        // Extract replaceBlocks flag (default to false if not specified)
        const replaceBlocks = parsedResponse.replaceBlocks === true;

        // Extract globalBlockStyles
        const globalBlockStyles = parsedResponse.globalBlockStyles;

        return {
            blocks: blocksWithIds,
            settings,
            replaceBlocks,
            globalBlockStyles
        };
    } catch (error) {
        console.error("AI Generation failed:", error);
        return { blocks: [], settings: {}, replaceBlocks: false };
    }
};

export const extractExperiencesFromResume = async (resumeText: string): Promise<any[]> => { 
    const prompt = `
    You are an AI that extracts structured work experience data from resume text.
    
    Resume Text:
    "${resumeText}"
    
    Extract the work experiences into a JSON array of objects with the following schema:
    [
        {
            "id": "generated_id",
            "company": "Company Name",
            "role": "Job Title",
            "period": "Start Date - End Date (e.g. Jan 2020 - Present)",
            "location": "City, Country",
            "description": "Brief description of responsibilities (max 200 chars)"
        }
    ]
    
    Rules:
    - If no experiences are found, return an empty array [].
    - Respond ONLY with the valid JSON array.
    - Summarize descriptions to be concise.
    - generate a random string id for the "id" field
    - CRITICAL: Detect the language of the provided "Resume Text". You must generate the "role", "description", "period" and "location" values in the SAME LANGUAGE as the resume text. Do NOT translate to English if the text is in Portuguese or another language.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant that extracts structured JSON data from text." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) return [];

        const parsed = JSON.parse(content);
        // Sometimes the model might wrap it in a key like "experiences", handle that or array directly
        if (Array.isArray(parsed)) return parsed;
        if (parsed.experiences && Array.isArray(parsed.experiences)) return parsed.experiences;
        
        // Fallback if structure is unexpected but valid JSON
        return [];
    } catch (error) {
        console.error("Error extracting experiences:", error);
        return [];
    }
};

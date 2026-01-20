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
        degree?: string;
    };
    profession: string;
    skills: string[];
    goals: string[];
}

export interface BioBlock {
    id: string;
    type: string;
    [key: string]: any;
}

const generateBlockId = (): string => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const SYSTEM_PROMPT = `You are an expert at creating professional portfolio/bio pages. 
Based on the user information provided, you must generate content blocks and page settings for a bio page.

IMPORTANT: You MUST respond ONLY with valid JSON, no additional text before or after.

=== AVAILABLE BLOCK TYPES ===
1. "heading" - Title. Fields: title (string), body (string), align ("left"|"center"|"right"), fontSize (e.g. "32px"), fontWeight ("700")
2. "text" - Paragraph. Fields: body (string), align ("left"|"center"|"right")
3. "button" - Link. Fields: title, href, buttonStyle ("solid"|"outline"|"white"|"glass"|"gradient"|"soft-shadow"|"neumorphism"), align, accent (hex), buttonShape ("pill"|"rounded"|"square")
4. "image" - Fields: mediaUrl (URL), align, imageStyle ("default"|"circle"|"rounded")
5. "socials" - Fields: socials ({instagram, linkedin, github, twitter, email, website, youtube, tiktok, whatsapp}), socialsLayout ("row"|"column")
6. "divider" - Fields: dividerStyle ("line"|"dots"|"space")
7. "video" - Fields: mediaUrl (YouTube/Vimeo URL)
8. "blog" - Fields: blogLayout ("carousel"|"list"|"grid"), blogCardStyle ("featured"|"minimal")
9. "product" - Fields: products ([{id, title, price, image, url}]), productLayout ("grid"|"list")
10. "calendar" - Fields: calendarTitle, calendarUrl
11. "map" - Fields: mapAddress, mapTitle
12. "featured" - Fields: featuredTitle, featuredDescription, featuredPrice, featuredUrl, featuredImage
13. "affiliate" - Fields: affiliateTitle, affiliateCode, affiliateImage
14. "event" - Fields: eventTitle, eventDate, eventButtonText, eventButtonUrl
15. "instagram" - Fields: instagramUsername (no @)
16. "youtube" - Fields: youtubeUrl
17. "spotify" - Fields: spotifyUrl
18. "qrcode" - Fields: qrCodeValue, qrCodeColor
19. "button_grid" - Fields: gridItems ([{id, title, url, icon}]). good for skills/links.
20. "form" - Fields: formTitle, formFields (["name", "email", "message"])
21. "portfolio" - Fields: portfolioTitle, portfolioItems ([{id, title, imageUrl, description, url}])
22. "marketing" - Fields: marketingTitle, marketingDescription
23. "whatsapp" - Fields: whatsappNumber, whatsappMessage 

=== PAGE SETTINGS ===
Generate a "settings" object with:
- bgType: "color" | "gradient" | "dots" | "grid" | "waves" | "mesh" | "particles" | "noise" | "abstract"
- bgColor: hex color for background (e.g., "#0f172a")
- bgSecondaryColor: hex color (e.g., "#334155")
- font: "Inter" | "Roboto" | "Open Sans" | "Merriweather" | "Oswald" | "Raleway" | "Poppins" | "Playfair Display" | "Montserrat" | "Lato"
- usernameColor: hex color for main texts/headers
- cardStyle: "none" | "flat" | "shadow" | "outline" | "glass"
- cardBackgroundColor: hex color (if cardStyle != none)

=== GENERATION RULES ===
- Analyze the user's profession, skills, and code.
- Create a WELCOMING Heading with their name/role.
- Write a PROFESSIONAL Introduction.
- If they have SKILLS, use a "button_grid" or "text" block to list them.
- If they have a PORTFOLIO/PROJECTS, use "portfolio" or "featured" blocks.
- If they want CONTACT, use "form" or "button" (mailto).
- CHOOSE A THEME (colors/fonts) that fits their persona (e.g., Developer = Dark/Techy, Designer = Clean/Creative, Lawyer = Serif/Trustworthy).
- Ensure "usernameColor" is visible against "bgColor".
- Limit to 5-8 blocks.
- Use English data/text.

=== JSON RESPONSE FORMAT ===
{
  "settings": { ... },
  "blocks": [ { "type": "...", "id": "...", ... }, ... ]
}`;

const buildUserPrompt = (answers: OnboardingAnswers): string => {
    let prompt = `Create bio/portfolio blocks for a person with the following characteristics:\n\n`;
    
    prompt += `**About the person:** ${answers.aboutYou}\n\n`;
    
    if (answers.education.hasGraduation && answers.education.degree) {
        prompt += `**Education:** Graduated in ${answers.education.degree}\n\n`;
    } else {
        prompt += `**Education:** No degree yet\n\n`;
    }
    
    prompt += `**Profession/Area:** ${answers.profession}\n\n`;
    
    if (answers.skills.length > 0) {
        prompt += `**Main skills:** ${answers.skills.join(", ")}\n\n`;
    }
    
    if (answers.goals.length > 0) {
        prompt += `**Goals with Portyo:** ${answers.goals.join(", ")}\n\n`;
    }
    
    prompt += `Generate the appropriate content blocks and settings for this person. Remember to respond ONLY with the JSON, no additional text.`;
    
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
            temperature: 0.7,
            max_tokens: 2048,
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
                title: name || "Welcome to my profile",
                body: "Professional in development",
            },
            {
                id: generateBlockId(),
                type: "text",
                body: "This is my portfolio page. I'll be adding more information about my professional journey soon.",
            },
            {
                id: generateBlockId(),
                type: "button",
                title: "Get in touch",
                href: "mailto:contact@example.com",
                buttonStyle: "solid",
            },
        ],
        settings: {
            bgType: "color",
            bgColor: "#f8fafc",
            font: "Inter",
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
  1. Background: Dark (e.g., #0f172a, #000000, #18181b)
  2. Text: Light (e.g., #f8fafc, #ffffff)
  3. Buttons/Accents: MID-TONE colors (e.g., #6366f1, #22c55e, #a855f7) - they should be vibrant and visible against the dark background, but not pure white.

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
- bgColor: hex color (e.g., "#1a1a2e")
- bgSecondaryColor: hex for patterns (e.g., "#16213e")
- cardStyle: "none" | "solid" | "frosted"
- cardBackgroundColor: hex color
- cardBackgroundColor: hex color
- usernameColor: hex color for name text
- font: "Inter" | "Roboto" | "Open Sans" | "Merriweather" | "Oswald" | "Raleway" | "Poppins"
- imageStyle: "circle" | "rounded" | "square" | "amoeba" | "star" | "hexagon"

=== RESPONSE FORMAT ===
{
  "blocks": [...],
  "settings": {...},
  "globalBlockStyles": { ... }, // Optional: Key-value pairs to apply to ALL existing blocks (e.g., textColor, accent)
  "replaceBlocks": true/false
}

=== EXAMPLES ===
- "Dark theme with white text": {"blocks": [], "settings": {"bgType": "color", "bgColor": "#000000", "usernameColor": "#FFFFFF"}, "replaceBlocks": false}
- "Add a white headline": {"blocks": [{"type": "heading", "title": "Hello", "textColor": "#FFFFFF"}], "settings": {}, "replaceBlocks": false}
- "Make a bio for a lawyer": {"blocks": [{"type": "heading", "title": "John Doe", "body": "Attorney at Law", "textColor": "#FFFFFF"}, {"type": "text", "body": "Specializing in corporate law.", "textColor": "#E0E0E0"}, {"type": "button", "title": "Consultation", "href": "https://", "buttonStyle": "solid", "accent": "#C0A062", "textColor": "#FFFFFF"}], "settings": {"bgType": "color", "bgColor": "#1a1a1a", "usernameColor": "#C0A062", "cardStyle": "solid", "cardBackgroundColor": "#2a2a2a"}, "replaceBlocks": true}
- "Dark mode": {
    "blocks": [],
    "settings": {"bgType": "color", "bgColor": "#0f172a", "usernameColor": "#f8fafc"},
    "globalBlockStyles": {"textColor": "#f8fafc", "accent": "#38bdf8", "buttonStyle": "solid"},
    "replaceBlocks": false
  }

Be creative! Use the right blocks for each profession.`;


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

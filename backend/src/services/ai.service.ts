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

const MAX_ABOUT_CHARS = 220;
const MAX_TEXT_BLOCK_CHARS = 220;
const MAX_HEADING_SUBTITLE_CHARS = 72;
const MAX_BUTTON_TITLE_CHARS = 28;

const compactText = (value: string): string => {
    return (value || "").replace(/\s+/g, " ").trim();
};

const trimAtWordBoundary = (value: string, maxChars: number): string => {
    const normalized = compactText(value);
    if (!normalized || maxChars <= 0 || normalized.length <= maxChars) {
        return normalized;
    }

    const sliced = normalized.slice(0, maxChars).trim();
    const lastSpaceIndex = sliced.lastIndexOf(" ");
    if (lastSpaceIndex >= Math.floor(maxChars * 0.55)) {
        return sliced.slice(0, lastSpaceIndex).trim();
    }

    return sliced;
};

export const buildProfessionalAboutSummary = (answers: OnboardingAnswers): string => {
    const about = compactText(answers.aboutYou);
    const profession = compactText(answers.profession);

    const skills = Array.isArray(answers.skills)
        ? answers.skills.map((skill) => compactText(skill)).filter(Boolean).slice(0, 3)
        : [];
    const goals = Array.isArray(answers.goals)
        ? answers.goals.map((goal) => compactText(goal)).filter(Boolean).slice(0, 2)
        : [];

    const hasEducation = answers.education?.hasGraduation;
    const educationParts = [
        compactText(answers.education?.courseName || ""),
        compactText(answers.education?.degree || ""),
    ].filter(Boolean);
    const educationSummary = hasEducation && educationParts.length > 0
        ? `Formal training in ${educationParts[0]}`
        : "";

    const summaryParts = [
        about,
        profession ? `Works as ${profession}` : "",
        skills.length > 0 ? `Key skills: ${skills.join(", ")}` : "",
        goals.length > 0 ? `Focused on ${goals.join(" and ")}` : "",
        educationSummary,
    ].filter(Boolean);

    return trimAtWordBoundary(summaryParts.join(". "), MAX_ABOUT_CHARS);
};

const normalizeGeneratedBlocks = (blocks: any[], answers: OnboardingAnswers): BioBlock[] => {
    const sourceBlocks = Array.isArray(blocks) ? blocks.filter(Boolean) : [];
    const aboutSummary = buildProfessionalAboutSummary(answers);

    const headingIndex = sourceBlocks.findIndex((block: any) => block?.type === "heading");
    const textIndex = sourceBlocks.findIndex((block: any) => block?.type === "text");

    const headingBlock = headingIndex >= 0
        ? { ...sourceBlocks[headingIndex] }
        : {
            type: "heading",
            title: compactText(answers.profession) || "Professional Profile",
            body: "",
            align: "center",
        };

    const textBlock = textIndex >= 0
        ? { ...sourceBlocks[textIndex] }
        : {
            type: "text",
            body: aboutSummary,
            align: "center",
        };

    if (typeof headingBlock.body === "string") {
        headingBlock.body = trimAtWordBoundary(headingBlock.body, MAX_HEADING_SUBTITLE_CHARS);
    }

    textBlock.body = aboutSummary;

    const remainingBlocks = sourceBlocks.filter((_, index) => index !== headingIndex && index !== textIndex);

    const normalizedOrderedBlocks = [headingBlock, textBlock, ...remainingBlocks].map((block: any) => {
        const nextBlock = { ...block };

        if (nextBlock.type === "text" && typeof nextBlock.body === "string") {
            nextBlock.body = trimAtWordBoundary(nextBlock.body, MAX_TEXT_BLOCK_CHARS);
        }

        if (nextBlock.type === "heading" && typeof nextBlock.body === "string") {
            nextBlock.body = trimAtWordBoundary(nextBlock.body, MAX_HEADING_SUBTITLE_CHARS);
        }

        if (nextBlock.type === "button" && typeof nextBlock.title === "string") {
            nextBlock.title = trimAtWordBoundary(nextBlock.title, MAX_BUTTON_TITLE_CHARS);
        }

        return nextBlock;
    });

    let normalizedBlocks = normalizedOrderedBlocks.slice(0, 8);

    const hasCTA = normalizedBlocks.some((block: any) => block?.type === "button");
    if (!hasCTA) {
        const ctaBlock = {
            type: "button",
            title: "Get in Touch",
            href: "mailto:contact@example.com",
            buttonStyle: "solid",
            align: "center",
        };

        if (normalizedBlocks.length >= 8) {
            normalizedBlocks[normalizedBlocks.length - 1] = ctaBlock;
        } else {
            normalizedBlocks.push(ctaBlock);
        }
    }

    return normalizedBlocks.map((block: any) => ({
        ...block,
        id: generateBlockId(),
        ...(block.type === "button_grid" && Array.isArray(block.gridItems)
            ? {
                gridItems: block.gridItems.map((item: any) => ({
                    ...item,
                    id: generateBlockId(),
                })),
            }
            : {}),
    }));
};

const SYSTEM_PROMPT = `You are PortyoAI, an elite AI architect for Portyo — a link-in-bio and digital portfolio platform (like Linktree, but with way more power). You create stunning, conversion-optimized personal pages that captivate visitors, build personal brands, and achieve business goals.

=== WHAT IS PORTYO? ===
Portyo lets users create a single-page portfolio/bio website with their unique URL (portyo.com/username).
The page is built from modular "blocks" that the user arranges. Each block has a specific function:
links, social media feeds, products, portfolios, blog posts, contact forms, event calendars, QR codes, and more.
Users can customize themes, backgrounds (33+ types including gradients, particles, aurora, marble, etc.),
floating elements, parallax effects, card styles, fonts, and animations.
The platform supports SEO/GEO/AEO optimization, auto-posting AI blog content, custom domains, and analytics.

=== CRITICAL RULES ===
- Respond ONLY with valid JSON. No markdown, no explanations, no text before or after.
- All content must be in the SAME LANGUAGE as the user's input (if user writes in Portuguese, generate everything in Portuguese).
- Create content that is CONCISE, SCANNABLE, and conversion-focused.
- KEEP IT SHORT: max 2-3 sentences per text block (150-200 chars).
- AVOID long paragraphs - they look terrible on mobile.
- NO bullet points (•) inside text blocks — use button_grid for lists.
- Use SHORT sentences - one idea per sentence.
- NO generic filler phrases like "apaixonado por", "dedicado a", "comprometido com", "passionate about".
- Focus on RESULTS and OUTCOMES, not vague descriptions.

=== AVAILABLE BLOCK TYPES (26 total) ===

CORE CONTENT:
1. "heading" - Main title / name
    Fields: title (string), body (optional subtitle, max 7 words), align ("left"|"center"|"right"), fontSize (number), fontWeight (number), textColor (hex)
    Best for: User's name + short tagline

2. "text" - Short paragraph
    Fields: body (string, MAX 200 chars), align, textColor (hex)
    Best for: Brief bio description, 1-2 punchy sentences

3. "button" - CTA link button
    Fields: title (string, 2-4 words), href (url), buttonStyle ("solid"|"outline"|"gradient"|"glass"|"hard-shadow"|"soft-shadow"|"3d"|"neumorphism"|"clay"|"cyberpunk"|"neon"|"brutalist"|"minimal-underline"), buttonShape ("pill"|"rounded"|"square"), align, accent (hex bg color), textColor (hex text color)
    Best for: Call-to-action (e.g. "Hire Me", "View Portfolio", "Book a Call")

4. "divider" - Visual separator
    Fields: dividerStyle ("line"|"dots"|"space")
    Best for: Breathing room between sections

5. "button_grid" - Grid of clickable buttons/chips
    Fields: gridItems (array of {id: string, title: string, url: string, icon?: string})
    Best for: Skill tags, link collections, service listings

MEDIA:
6. "image" - Image with effects
    Fields: mediaUrl, align, imageStyle ("default"|"circle"|"rounded"), imageHoverEffect (optional)

7. "video" - Video embed
    Fields: mediaUrl

8. "youtube" - YouTube content
    Fields: youtubeUrl, youtubeDisplayType ("grid"|"list"), youtubeVariation ("full-channel"|"single-video"|"playlist")

9. "spotify" - Spotify embed
    Fields: spotifyUrl, spotifyCompact (boolean), spotifyVariation ("artist-profile"|"single-track"|"playlist"|"album")

10. "instagram" - Instagram feed
     Fields: instagramUsername (without @), instagramDisplayType ("grid"|"list"), instagramVariation ("grid-shop"|"visual-gallery"|"simple-link")

SOCIAL / CONTACT:
11. "socials" - Social media links (supports 19 platforms)
     Fields: socials (object with optional keys: instagram, tiktok, twitter, youtube, linkedin, email, website, github, facebook, threads, twitch, discord, pinterest, snapchat, whatsapp, telegram, spotify, behance, dribbble), socialsLayout ("row"|"column"), socialsVariation ("icon-grid"|"detailed-list"|"floating-buttons")
     IMPORTANT: Only include platforms relevant to the user's profession. Leave URLs empty — the user will fill them.

12. "whatsapp" - WhatsApp CTA button
     Fields: whatsappNumber, whatsappMessage, whatsappStyle, whatsappShape, whatsappVariation ("direct-button"|"pre-filled-form"), accent (hex), textColor (hex)

COMMERCE:
13. "product" - Product listing
     Fields: products (array of {id, title, price, image, url}), productLayout ("grid"|"list"|"carousel"), productCardStyle ("default"|"minimal")

14. "featured" - Featured/hero item
     Fields: featuredTitle, featuredPrice, featuredImage, featuredUrl, featuredColor (hex), featuredTextColor (hex)

15. "affiliate" - Affiliate/coupon code
     Fields: affiliateTitle, affiliateCode, affiliateImage, affiliateUrl, affiliateColor (hex), affiliateTextColor (hex)

GROWTH / UTILITIES:
16. "form" - Lead capture / contact form
     Fields: formId, formBackgroundColor (hex), formTextColor (hex)
     Best for: Collecting emails, leads, inquiries

17. "portfolio" - Portfolio gallery
     Fields: portfolioTitle
     Best for: Showcasing visual work (design, photo, art)

18. "experience" - Work experience timeline
     Fields: experienceTitle, experiences (array of {id, role, company, period, location, description})
     Best for: Professional timeline, CV-style display

19. "blog" - Blog post feed
     Fields: blogLayout ("carousel"|"list"|"grid"|"magazine"), blogCardStyle ("featured"|"minimal"|"modern"|"overlay"|"horizontal"), blogPostCount

20. "calendar" - Booking calendar
     Fields: calendarTitle, calendarUrl

21. "map" - Location map
     Fields: mapTitle, mapAddress

22. "event" - Event with countdown
     Fields: eventTitle, eventDate (ISO), eventButtonText, eventButtonUrl, eventColor (hex), eventTextColor (hex)

23. "tour" - Tour/show dates
     Fields: tourTitle, tours (array of {id, date, location, venue, ticketUrl, soldOut})

24. "qrcode" - QR Code
     Fields: qrCodeValue (url), qrCodeLayout ("single"|"multiple"|"grid"), qrCodeColor (hex), qrCodeBgColor (hex)

25. "marketing" - Promotional banner
     Fields: marketingTitle, marketingDescription, marketingImageUrl, marketingLinkUrl, marketingButtonText, marketingLayout ("card"|"banner"|"compact"|"featured")

=== BLOCK CONTAINER EFFECTS (optional, apply to any block) ===
These make pages look premium. Use sparingly (2-3 blocks max):
- blockShadow: "none"|"sm"|"md"|"lg"|"glow"
- blockBorderRadius: 0-40
- blockBackground: hex color (for block-level background)
- entranceAnimation: "none"|"fadeIn"|"slideUp"|"slideDown"|"zoomIn"|"bounceIn"|"flipIn"
- entranceDelay: 0-500 (stagger animations for visual flow)

=== PAGE SETTINGS ===
Generate an optimized "settings" object. Choose wisely based on the user's profession and vibe:

Background types (bgType): "color"|"gradient"|"mesh-gradient"|"noise"|"abstract"|"particles"|"waves"|"aurora"|"dots"|"grid"|"marble"|"concrete"|"frosted-glass"|"starfield"|"confetti"
Fonts: "Inter"|"Space Grotesk"|"Plus Jakarta Sans"|"DM Sans"
Card styles: "none"|"solid"|"frosted"
Image styles: "circle" (personal brands) | "rounded" (corporate) | "square" (minimal)

=== CONTENT GENERATION STRATEGY ===

Based on the user's CATEGORY + SKILLS + GOALS, generate the right mix of blocks:

FOR CREATORS (designers, photographers, artists):
→ heading + text + portfolio + button_grid (skills) + socials + button (CTA)
→ Focus on visual showcase, use "frosted" cards, modern fonts

FOR BUSINESS (marketers, consultants, entrepreneurs):
→ heading + text + experience + button (CTA: "Schedule a Meeting") + form + socials
→ Professional tone, clean layout, lead capture focus

FOR TECH (developers, engineers):
→ heading + text + button_grid (tech stack) + experience + socials (github, linkedin) + button (CTA)
→ Clean, minimal, show competence not fluff

FOR ENTERTAINMENT (musicians, streamers, actors):
→ heading + text + spotify/youtube/instagram + tour/event + socials + button
→ Vibrant, energetic, media-heavy

FOR EDUCATION (teachers, researchers):
→ heading + text + experience + blog + button (resources) + socials
→ Authoritative, clear, organized

FOR FASHION (stylists, designers, models):
→ heading + text + instagram + portfolio + product + socials
→ Visual-first, elegant, trendy

FOR PERSONAL (bloggers, lifestyle):
→ heading + text + button_grid (interests) + blog + socials + button
→ Warm, authentic, relatable

FOR E-COMMERCE / SELLERS:
→ heading + text + product/featured + button (CTA: "Shop Now") + socials
→ Conversion-focused, trust-building

=== GOAL-AWARE BLOCK SELECTION ===
- "Showcase portfolio" → always include "portfolio" block
- "Grow audience" → include "socials" with platform-relevant networks + "blog"
- "Network" → include "socials" + "button" with LinkedIn/contact CTA
- "Sell products" → include "product" or "featured" block
- "Get hired" → include "experience" + "portfolio" + "button" (CTA: hire me)
- "Build brand" → include strong heading + text + "socials" + visual blocks
- "Share content" → include media blocks (youtube/spotify/instagram/blog)
- "Generate leads" → include "form" block + "button" with booking/contact CTA

=== THEME-AWARE DESIGN ===
If a theme is selected, RESPECT its:
- Color palette (adapt all block colors for proper contrast)
- Typography style
- Card preferences
- Overall aesthetic

=== COLOR HARMONY RULES ===
- Dark backgrounds → light text (#f8fafc, #e2e8f0)
- Light backgrounds → dark text (#0a0a0f, #1a1a2e)
- Accent colors should POP against the background
- CTA buttons should have the highest contrast
- Never use low-contrast combinations (gray on gray, etc.)

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
    "cardBorderRadius": 12,
    "imageStyle": "..."
  },
  "blocks": [
    { "type": "heading", "id": "1", "title": "...", "body": "...", "align": "center", "textColor": "#..." },
    { "type": "text", "id": "2", "body": "...", "align": "center", "textColor": "#..." },
    ...
  ]
}`;

const buildUserPrompt = (answers: OnboardingAnswers): string => {
    const aboutSummary = buildProfessionalAboutSummary(answers);
    let prompt = `Create a professional, conversion-optimized Portyo bio page for the following person:\n\n`;
    
    prompt += `=== PROFESSIONAL PROFILE ===\n`;
    prompt += `About (raw): ${answers.aboutYou}\n`;
    prompt += `About (preferred concise): ${aboutSummary}\n`;
    prompt += `Profession: ${answers.profession}\n`;
    
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
        prompt += `\n`;
    } else {
        prompt += `Education: Self-taught / No formal degree\n`;
    }
    
    if (answers.skills.length > 0) {
        prompt += `Key Skills/Super Powers: ${answers.skills.join(", ")}\n`;
    }
    
    if (answers.goals.length > 0) {
        prompt += `\n=== USER'S PRIMARY GOALS ===\n`;
        prompt += `${answers.goals.join(", ")}\n`;
        prompt += `IMPORTANT: Choose block types that directly serve these goals. For example:\n`;
        prompt += `- If "Sell products" → must include a "product" or "featured" block\n`;
        prompt += `- If "Get hired" → must include "experience" + hire CTA\n`;
        prompt += `- If "Grow audience" → must include "socials" + content blocks\n`;
        prompt += `- If "Showcase portfolio" → must include "portfolio" block\n`;
        prompt += `- If "Generate leads" → must include "form" block\n`;
        prompt += `- If "Share content" → include media blocks relevant to their content type\n`;
    }
    
    if (answers.resumeText) {
        prompt += `\n=== RESUME/CV CONTENT ===\n${answers.resumeText}\n`;
        prompt += `Use this resume data to populate "experience" blocks with real data and enhance the bio.\n`;
    }
    
    if (answers.theme?.name) {
        prompt += `\n=== SELECTED THEME ===\n`;
        prompt += `Theme: ${answers.theme.name}\n`;
        if (answers.theme.styles) {
            prompt += `Background Type: ${answers.theme.styles.bgType}\n`;
            prompt += `Background Color: ${answers.theme.styles.bgColor}\n`;
            prompt += `Card Style: ${answers.theme.styles.cardStyle}\n`;
            prompt += `Font: ${answers.theme.styles.font}\n`;
            prompt += `Username Color: ${answers.theme.styles.usernameColor}\n`;
            if (answers.theme.styles.cardBackgroundColor) {
                prompt += `Card Background: ${answers.theme.styles.cardBackgroundColor}\n`;
            }
        }
        prompt += `CRITICAL: Adapt ALL block text colors to have proper contrast against this theme.\n`;
    }
    
    prompt += `\n=== GENERATION RULES ===\n`;
    prompt += `1. KEEP ALL CONTENT SHORT AND CONCISE - users scan, they don't read long text\n`;
    prompt += `2. Text blocks: MAXIMUM 2-3 short sentences (150-200 characters total)\n`;
    prompt += `3. NO bullet points with • in text blocks — use button_grid for lists instead\n`;
    prompt += `4. NO generic filler phrases ("apaixonado por", "dedicado a", "passionate about")\n`;
    prompt += `5. Use SPECIFIC language about what they DO and the RESULTS they deliver\n`;
    prompt += `6. Focus on OUTCOMES not vague descriptions\n`;
    prompt += `7. Create 5-8 blocks total (heading + bio text + goal-specific blocks + socials + CTA)\n`;
    prompt += `8. Use dividers between major sections for visual breathing room\n`;
    prompt += `9. Include at least ONE clear CTA button with actionable text (2-4 words)\n`;
    prompt += `10. The "socials" block should only list platforms relevant to the profession (leave URLs empty)\n`;
    prompt += `11. Use entrance animations sparingly: "fadeIn" or "slideUp" on key blocks only\n`;
    prompt += `12. Respond ONLY with the JSON object. No additional text.\n`;
    prompt += `13. The SECOND block must be "text" and contain only the concise preferred about summary (max ${MAX_TEXT_BLOCK_CHARS} chars).\n`;
    prompt += `14. NEVER copy the full raw about text when it is long; rewrite it into an elegant, concise professional summary.\n`;
    prompt += `15. Keep tone elegant, professional, and result-oriented with short readable sentences.\n`;
    
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

export const generateBioFromOnboarding = async (answers: OnboardingAnswers): Promise<{ blocks: BioBlock[], settings: any, aboutSummary: string }> => {
    try {
        const aboutSummary = buildProfessionalAboutSummary(answers);

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
            temperature: 0.25,
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

        const blocksWithIds = normalizeGeneratedBlocks(blocks, answers);

        return { blocks: blocksWithIds, settings, aboutSummary };
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

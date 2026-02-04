import { Router, Request, Response } from "express";
import { AppDataSource } from "../../../database/datasource";
import { BioEntity } from "../../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../../../shared/errors/api-error";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { groqChatCompletion } from "../../../services/groq-client.service";
import type { ChatCompletion } from "groq-sdk/resources/chat/completions";

const router = Router();
const bioRepository = AppDataSource.getRepository(BioEntity);

interface GenerateSEORequest {
    field: "seoTitle" | "seoDescription" | "seoKeywords" | "ogTitle" | "ogDescription";
    bioDescription?: string;
    currentValue?: string;
    fullName?: string;
    profession?: string;
}

const SYSTEM_PROMPT = `You are an expert SEO specialist and copywriter. Your task is to generate optimized SEO content for bio/portfolio pages.
Generate content that is:
- SEO-friendly and keyword-rich
- Engaging and click-worthy
- Appropriate length for each field type
- In the same language as the user's bio description

Respond ONLY with the generated content text, no explanations, no quotes around the response.`;

const generateFieldContent = async (
    field: string,
    bioDescription: string,
    fullName: string,
    profession: string
): Promise<string> => {
    let prompt = "";

    switch (field) {
        case "seoTitle":
            prompt = `Generate an SEO-optimized page title for ${fullName || "a professional"}'s bio page.

Profile Information:
- Name: ${fullName || "Professional"}
- Description: ${bioDescription || "A professional portfolio page"}
- Profession: ${profession || "Various fields"}

Requirements:
- Length: 50-60 characters maximum
- Include the person's name
- Include relevant keywords about their profession
- Make it compelling and clickable
- Do NOT use quotes around the response

Generate only the title text:`;
            break;

        case "seoDescription":
            prompt = `Generate an SEO-optimized meta description for ${fullName || "a professional"}'s bio page.

Profile Information:
- Name: ${fullName || "Professional"}
- Description: ${bioDescription || "A professional portfolio page"}
- Profession: ${profession || "Various fields"}

Requirements:
- Length: 150-160 characters maximum
- Include a compelling call-to-action
- Highlight key value propositions
- Use active voice
- Make it enticing for users to click
- Do NOT use quotes around the response

Generate only the description text:`;
            break;

        case "seoKeywords":
            prompt = `Generate SEO keywords for ${fullName || "a professional"}'s bio page.

Profile Information:
- Name: ${fullName || "Professional"}
- Description: ${bioDescription || "A professional portfolio page"}
- Profession: ${profession || "Various fields"}

Requirements:
- Generate 5-10 relevant keywords
- Separate keywords with commas
- Include profession-specific terms
- Include both broad and long-tail keywords
- Do NOT use quotes around the response

Generate only the comma-separated keywords:`;
            break;

        case "ogTitle":
            prompt = `Generate an engaging social media title (Open Graph) for ${fullName || "a professional"}'s bio page.

Profile Information:
- Name: ${fullName || "Professional"}
- Description: ${bioDescription || "A professional portfolio page"}
- Profession: ${profession || "Various fields"}

Requirements:
- Length: 40-60 characters
- Make it social-media friendly
- Include emojis if appropriate
- Should encourage clicks when shared
- More casual and engaging than SEO title
- Do NOT use quotes around the response

Generate only the social media title:`;
            break;

        case "ogDescription":
            prompt = `Generate an engaging social media description (Open Graph) for ${fullName || "a professional"}'s bio page.

Profile Information:
- Name: ${fullName || "Professional"}
- Description: ${bioDescription || "A professional portfolio page"}
- Profession: ${profession || "Various fields"}

Requirements:
- Length: 100-150 characters
- Make it social-media friendly
- Should encourage engagement when shared
- More conversational than meta description
- Include a subtle call-to-action
- Do NOT use quotes around the response

Generate only the social media description:`;
            break;

        default:
            throw new Error("Invalid field type");
    }

    const completion = await groqChatCompletion({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 500
    }) as ChatCompletion;

    const content = completion.choices[0]?.message?.content?.trim() || "";
    
    // Remove surrounding quotes if present
    return content.replace(/^["'](.*)["']$/, '$1').trim();
};

router.post(
    "/generate-seo",
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { bioId } = req.query;
            const { field, bioDescription, currentValue, fullName, profession } = req.body as GenerateSEORequest;

            if (!bioId || typeof bioId !== "string") {
                throw new ApiError(APIErrors.badRequestError, "Bio ID is required", 400);
            }

            if (!field || !["seoTitle", "seoDescription", "seoKeywords", "ogTitle", "ogDescription"].includes(field)) {
                throw new ApiError(APIErrors.badRequestError, "Valid field type is required", 400);
            }

            // Get bio to verify ownership
            const bio = await bioRepository.findOne({
                where: { id: bioId },
                relations: ["user"]
            });

            if (!bio) {
                throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
            }

            // Verify ownership
            const userId = req.user?.id;
            if (!userId) throw new ApiError(APIErrors.unauthorizedError, "Not Authenticated", 401);

            if (bio.userId !== userId) {
                throw new ApiError(APIErrors.authorizationError, "User not authorized", 403);
            }

            // Generate content using AI
            const generatedContent = await generateFieldContent(
                field,
                bioDescription || bio.description || "",
                fullName || bio.user?.fullName || "",
                profession || ""
            );

            return res.json({
                success: true,
                field,
                content: generatedContent
            });

        } catch (error: any) {
            console.error("SEO Generation Error:", error);
            if (error instanceof ApiError) {
                return res.status(error.code).json({ error: error.message });
            }
            return res.status(500).json({ error: "Failed to generate SEO content" });
        }
    }
);

export default router;

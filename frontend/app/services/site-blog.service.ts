
import { api } from "./api";

export interface SitePost {
    id: string;
    title: string;
    content: string;
    thumbnail: string | null;
    language?: string;
    keywords: string[];
    views?: number;
    titleEn?: string | null;
    titlePt?: string | null;
    contentEn?: string | null;
    contentPt?: string | null;
    keywordsEn?: string | null;
    keywordsPt?: string | null;
    status: "draft" | "published";
    scheduledAt: string | null;
    createdAt: string;
    updatedAt: string;
    slug?: string | null;
}

export const getPublicSitePosts = async (lang: string = 'en'): Promise<SitePost[]> => {
    try {
        const response = await api.get<SitePost[]>(`/public/site-blog?lang=${lang}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch site posts", error);
        return [];
    }
};

export const getPublicSitePost = async (id: string, lang: string = 'en'): Promise<SitePost | null> => {
    try {
        const response = await api.get<SitePost>(`/public/site-blog/${id}?lang=${lang}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch site post", error);
        return null;
    }
};

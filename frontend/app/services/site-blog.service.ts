
import { api } from "./api";

export interface SitePost {
    id: string;
    title: string;
    content: string;
    thumbnail: string | null;
    keywords: string[];
    status: "draft" | "published";
    scheduledAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export const getPublicSitePosts = async (): Promise<SitePost[]> => {
    try {
        const response = await api.get<SitePost[]>('/public/site-blog');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch site posts", error);
        return [];
    }
};

export const getPublicSitePost = async (id: string): Promise<SitePost | null> => {
    try {
        const response = await api.get<SitePost>(`/public/site-blog/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch site post", error);
        return null;
    }
};

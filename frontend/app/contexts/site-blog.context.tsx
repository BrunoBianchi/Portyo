import React, { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { api } from "~/services/api";
import { useAuth } from "./auth.context";

export type SitePost = {
    id: string;
    title: string;
    content: string;
    keywords: string;
    views: number;
    status: string;
    scheduledAt: string | null;
    createdAt: string;
    updatedAt: string;
    thumbnail?: string | null;
    language?: string;
    titleEn?: string | null;
    titlePt?: string | null;
    contentEn?: string | null;
    contentPt?: string | null;
    keywordsEn?: string | null;
    keywordsPt?: string | null;
};

interface SiteBlogContextType {
    posts: SitePost[];
    loading: boolean;
    fetchPosts: () => Promise<void>;
    createPost: (data: Partial<SitePost>) => Promise<SitePost>;
    updatePost: (id: string, data: Partial<SitePost>) => Promise<SitePost>;
    deletePost: (id: string) => Promise<void>;
}

const SiteBlogContext = createContext<SiteBlogContextType | undefined>(undefined);

export const SiteBlogProvider = ({ children }: { children: ReactNode }) => {
    const [posts, setPosts] = useState<SitePost[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { signed } = useAuth();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get("/site-blog");
            setPosts(response.data);
        } catch (error) {
            console.error("Failed to fetch site posts", error);
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (data: Partial<SitePost>) => {
        const response = await api.post("/site-blog", data);
        setPosts((prev) => [response.data, ...prev]);
        return response.data;
    };

    const updatePost = async (id: string, data: Partial<SitePost>) => {
        const response = await api.put(`/site-blog/${id}`, data);
        setPosts((prev) => prev.map((post) => (post.id === id ? response.data : post)));
        return response.data;
    };

    const deletePost = async (id: string) => {
        await api.delete(`/site-blog/${id}`);
        setPosts((prev) => prev.filter((post) => post.id !== id));
    };

    useEffect(() => {
        if (signed) {
            fetchPosts();
        }
    }, [signed]);

    return (
        <SiteBlogContext.Provider value={{ posts, loading, fetchPosts, createPost, updatePost, deletePost }}>
            {children}
        </SiteBlogContext.Provider>
    );
};

export const useSiteBlog = () => {
    const context = useContext(SiteBlogContext);
    if (context === undefined) {
        throw new Error("useSiteBlog must be used within a SiteBlogProvider");
    }
    return context;
};

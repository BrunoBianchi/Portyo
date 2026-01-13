import React, { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { api } from "~/services/api";
import { useAuth } from "./auth.context";
import { useBio } from "./bio.context";

export type Post = {
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
};

interface BlogContextType {
    posts: Post[];
    loading: boolean;
    fetchPosts: () => Promise<void>;
    createPost: (data: Partial<Post>) => Promise<Post>;
    updatePost: (id: string, data: Partial<Post>) => Promise<Post>;
    deletePost: (id: string) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { signed } = useAuth();
    const { bio } = useBio();

    const fetchPosts = async () => {
        if (!bio) return;
        setLoading(true);
        try {
            const response = await api.get(`/blog/${bio.id}`);
            setPosts(response.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (data: Partial<Post>) => {
        if (!bio) throw new Error("No bio selected");
        const response = await api.post("/blog", { ...data, bioId: bio.id });
        setPosts((prev) => [response.data, ...prev]);
        return response.data;
    };

    const updatePost = async (id: string, data: Partial<Post>) => {
        const response = await api.put(`/blog/${id}`, data);
        setPosts((prev) => prev.map((post) => (post.id === id ? response.data : post)));
        return response.data;
    };

    const deletePost = async (id: string) => {
        await api.delete(`/blog/${id}`);
        setPosts((prev) => prev.filter((post) => post.id !== id));
    };

    useEffect(() => {
        if (signed && bio) {
            fetchPosts();
        } else {
            setPosts([]);
        }
    }, [signed, bio]);

    return (
        <BlogContext.Provider value={{ posts, loading, fetchPosts, createPost, updatePost, deletePost }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (context === undefined) {
        throw new Error("useBlog must be used within a BlogProvider");
    }
    return context;
};

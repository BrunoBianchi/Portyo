import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "~/services/api";

export type SitePostFrequency = "5hours" | "daily" | "weekly" | "biweekly" | "monthly";

export interface SiteAutoPostSchedule {
    id: string;
    userId: string;
    isActive: boolean;
    frequency: SitePostFrequency;
    topics: string | null;
    keywords: string[] | null;
    targetAudience: string | null;
    tone: string;
    postLength: string;
    language: string;
    nextPostDate: string | null;
    lastPostDate: string | null;
    postsThisMonth: number;
    currentMonth: string | null;
    preferredTime: string;
    startDate: string | null;
    targetCountry: string | null;
    categories: string[] | null;
    bilingual: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SiteAutoPostLog {
    id: string;
    scheduleId: string;
    postId: string | null;
    status: "generated" | "published" | "failed";
    errorMessage: string | null;
    generatedTitle: string;
    generatedTitleEn: string | null;
    generatedContent: string;
    generatedContentEn: string | null;
    seoScore: number | null;
    geoScore: number | null;
    aeoScore: number | null;
    wordCount: number | null;
    createdAt: string;
}

export interface SiteAutoPostStats {
    schedule: SiteAutoPostSchedule | null;
    postsThisMonth: number;
    remainingPosts: number;
    nextPostDate: string | null;
    lastPostDate: string | null;
    recentLogs: SiteAutoPostLog[];
    averageScores: {
        avgSeoScore: number;
        avgGeoScore: number;
        avgAeoScore: number;
    };
}

export interface GeneratedSitePostPreview {
    title: string;
    titleEn: string | null;
    content: string;
    contentEn: string | null;
    keywords: string;
    keywordsEn: string | null;
    metaDescription: string;
    slug: string;
    wordCount: number;
    seoScore: number;
    geoScore: number;
    aeoScore: number;
    improvementSuggestions: string[];
}

interface SiteAutoPostContextType {
    schedule: SiteAutoPostSchedule | null;
    stats: SiteAutoPostStats | null;
    logs: SiteAutoPostLog[];
    loading: boolean;
    generatingPreview: boolean;
    saving: boolean;
    
    // Actions
    fetchSchedule: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchLogs: () => Promise<void>;
    createSchedule: (config: Partial<SiteAutoPostSchedule>) => Promise<SiteAutoPostSchedule>;
    updateSchedule: (config: Partial<SiteAutoPostSchedule>) => Promise<SiteAutoPostSchedule>;
    toggleSchedule: (isActive: boolean) => Promise<void>;
    deleteSchedule: () => Promise<void>;
    generatePreview: (config: Partial<SiteAutoPostSchedule>) => Promise<GeneratedSitePostPreview>;
}

const SiteAutoPostContext = createContext<SiteAutoPostContextType | undefined>(undefined);

export function SiteAutoPostProvider({ children }: { children: React.ReactNode }) {
    const [schedule, setSchedule] = useState<SiteAutoPostSchedule | null>(null);
    const [stats, setStats] = useState<SiteAutoPostStats | null>(null);
    const [logs, setLogs] = useState<SiteAutoPostLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchSchedule = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/site-auto-post/schedule");
            setSchedule(response.data.schedule);
        } catch (error) {
            console.error("Failed to fetch site auto-post schedule:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/site-auto-post/stats");
            setStats(response.data.stats);
        } catch (error) {
            console.error("Failed to fetch site auto-post stats:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLogs = useCallback(async () => {
        try {
            const response = await api.get("/site-auto-post/logs");
            setLogs(response.data.logs);
        } catch (error) {
            console.error("Failed to fetch site auto-post logs:", error);
        }
    }, []);

    const createSchedule = useCallback(async (config: Partial<SiteAutoPostSchedule>) => {
        try {
            setSaving(true);
            const response = await api.post("/site-auto-post/schedule", config);
            const newSchedule = response.data.schedule;
            setSchedule(newSchedule);
            return newSchedule;
        } catch (error) {
            console.error("Failed to create site auto-post schedule:", error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, []);

    const updateSchedule = useCallback(async (config: Partial<SiteAutoPostSchedule>) => {
        try {
            setSaving(true);
            const response = await api.post("/site-auto-post/schedule", config);
            const updatedSchedule = response.data.schedule;
            setSchedule(updatedSchedule);
            return updatedSchedule;
        } catch (error) {
            console.error("Failed to update site auto-post schedule:", error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, []);

    const toggleSchedule = useCallback(async (isActive: boolean) => {
        try {
            setSaving(true);
            await api.patch("/site-auto-post/toggle", { isActive });
            await fetchSchedule();
            await fetchStats();
        } catch (error) {
            console.error("Failed to toggle site auto-post schedule:", error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [fetchSchedule, fetchStats]);

    const deleteSchedule = useCallback(async () => {
        try {
            setSaving(true);
            await api.delete("/site-auto-post/schedule");
            setSchedule(null);
            await fetchStats();
        } catch (error) {
            console.error("Failed to delete site auto-post schedule:", error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [fetchStats]);

    const generatePreview = useCallback(async (config: Partial<SiteAutoPostSchedule>) => {
        try {
            setGeneratingPreview(true);
            const response = await api.post("/site-auto-post/preview", config);
            return response.data.preview;
        } catch (error) {
            console.error("Failed to generate site post preview:", error);
            throw error;
        } finally {
            setGeneratingPreview(false);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        fetchSchedule();
        fetchStats();
        fetchLogs();
    }, [fetchSchedule, fetchStats, fetchLogs]);

    return (
        <SiteAutoPostContext.Provider
            value={{
                schedule,
                stats,
                logs,
                loading,
                generatingPreview,
                saving,
                fetchSchedule,
                fetchStats,
                fetchLogs,
                createSchedule,
                updateSchedule,
                toggleSchedule,
                deleteSchedule,
                generatePreview,
            }}
        >
            {children}
        </SiteAutoPostContext.Provider>
    );
}

export function useSiteAutoPost() {
    const context = useContext(SiteAutoPostContext);
    if (context === undefined) {
        throw new Error("useSiteAutoPost must be used within a SiteAutoPostProvider");
    }
    return context;
}

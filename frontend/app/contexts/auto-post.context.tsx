import React, { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { api } from "~/services/api";
import { useAuth } from "./auth.context";
import { useBio } from "./bio.context";

export type PostFrequency = "daily" | "weekly" | "biweekly" | "monthly";

// ========== METRICS TYPES ==========

export interface KeywordAnalysis {
    primaryKeyword: string;
    secondaryKeywords: string[];
    semanticKeywords: string[];
    keywordDensity: number;
    lsiKeywords: string[];
}

export interface ReadabilityMetrics {
    fleschReadingEase: number;
    fleschKincaidGrade: number;
    averageSentenceLength: number;
    averageWordLength: number;
    totalWords: number;
    totalSentences: number;
}

export interface ContentAnalysis {
    headingsCount: number;
    h2Count: number;
    h3Count: number;
    paragraphCount: number;
    listCount: number;
    imageCount: number;
    internalLinksCount: number;
    externalLinksCount: number;
    hasCTA: boolean;
    contentDepth: "basic" | "standard" | "comprehensive" | "expert";
}

export interface EntityAnalysis {
    mainEntities: string[];
    relatedEntities: string[];
    entitySalience: Record<string, number>;
    topicCategories: string[];
}

export interface AIOptimization {
    answerTargets: string[];
    questionCoverage: string[];
    snippetCandidates: string[];
    voiceSearchOptimized: boolean;
    chatGptFriendly: boolean;
}

export interface SEOMetrics {
    seoScore: number;
    titleOptimizationScore: number;
    metaDescriptionScore: number;
    contentStructureScore: number;
    keywordDensityScore: number;
    readabilityScore: number;
    internalLinkingScore: number;
}

export interface GEOMetrics {
    geoScore: number;
    entityRecognitionScore: number;
    answerOptimizationScore: number;
    structuredDataScore: number;
    authoritySignalsScore: number;
    contextClarityScore: number;
    conversationalValueScore: number;
    featuredSnippetScore: number;
}

export interface AEOMetrics {
    aeoScore: number;
    answerRelevanceScore: number;
    directAnswerScore: number;
    questionOptimizationScore: number;
    voiceSearchScore: number;
    clarityScore: number;
    concisenessScore: number;
    factualAccuracyScore: number;
}

export interface AIOMetrics {
    aioScore: number;
    promptEfficiencyScore: number;
    contextAdherenceScore: number;
    hallucinationResistanceScore: number;
    citationQualityScore: number;
    multiTurnOptimizationScore: number;
    instructionFollowingScore: number;
    outputConsistencyScore: number;
}

export interface ContentQualityMetrics {
    originalityScore: number;
    depthScore: number;
    engagementPotentialScore: number;
    freshnessScore: number;
}

// ========== ENTITY TYPES ==========

export type AutoPostSchedule = {
    id: string;
    bioId: string;
    userId: string;
    isActive: boolean;
    frequency: PostFrequency;
    topics: string | null;
    keywords: string[] | null;
    targetAudience: string | null;
    tone: string;
    postLength: string;
    language: string | null;
    nextPostDate: string | null;
    lastPostDate: string | null;
    postsThisMonth: number;
    currentMonth: string | null;
    bioSummary: string | null;
    bioSummaryGeneratedAt: string | null;
    preferredTime: string;
    startDate: string | null;
    targetCountry: string | null;
    createdAt: string;
    updatedAt: string;
};

export type AutoPostLog = {
    id: string;
    scheduleId: string;
    postId: string | null;
    status: "generated" | "published" | "failed";
    errorMessage: string | null;
    generatedTitle: string;
    generatedContent: string;
    generatedKeywords: string;
    createdAt: string;
    
    // Basic SEO
    seoScore: number | null;
    geoScore: number | null;
    metaDescription: string | null;
    slug: string | null;
    titleLength: number | null;
    metaDescriptionLength: number | null;
    
    // Detailed Metrics
    titleOptimizationScore: number | null;
    metaDescriptionScore: number | null;
    contentStructureScore: number | null;
    keywordDensityScore: number | null;
    readabilityScore: number | null;
    internalLinkingScore: number | null;
    entityRecognitionScore: number | null;
    answerOptimizationScore: number | null;
    structuredDataScore: number | null;
    authoritySignalsScore: number | null;
    contextClarityScore: number | null;
    conversationalValueScore: number | null;
    featuredSnippetScore: number | null;
    
    // AEO Metrics
    aeoScore: number | null;
    answerRelevanceScore: number | null;
    directAnswerScore: number | null;
    questionOptimizationScore: number | null;
    voiceSearchScore: number | null;
    clarityScore: number | null;
    concisenessScore: number | null;
    factualAccuracyScore: number | null;
    
    // AIO Metrics
    aioScore: number | null;
    promptEfficiencyScore: number | null;
    contextAdherenceScore: number | null;
    hallucinationResistanceScore: number | null;
    citationQualityScore: number | null;
    multiTurnOptimizationScore: number | null;
    instructionFollowingScore: number | null;
    outputConsistencyScore: number | null;
    
    originalityScore: number | null;
    depthScore: number | null;
    engagementPotentialScore: number | null;
    freshnessScore: number | null;
    
    // JSON Analysis
    keywordAnalysis: KeywordAnalysis | null;
    readabilityMetrics: ReadabilityMetrics | null;
    contentAnalysis: ContentAnalysis | null;
    entityAnalysis: EntityAnalysis | null;
    aiOptimization: AIOptimization | null;
    
    // Suggestions
    improvementSuggestions: string[] | null;
    geoSuggestions: string[] | null;
    aeoSuggestions: string[] | null;
    aioSuggestions: string[] | null;
};

export type AutoPostStats = {
    schedule: AutoPostSchedule | null;
    postsThisMonth: number;
    remainingPosts: number;
    nextPostDate: string | null;
    lastPostDate: string | null;
    recentLogs: AutoPostLog[];
    averageScores: {
        avgSeoScore: number;
        avgGeoScore: number;
        avgAeoScore: number;
        avgAioScore: number;
        avgReadability: number;
    };
};

export type GeneratedPostPreview = {
    title: string;
    content: string;
    keywords: string;
    slug: string;
    metaDescription: string;
    titleLength: number;
    metaDescriptionLength: number;
    
    seoMetrics: SEOMetrics;
    geoMetrics: GEOMetrics;
    aeoMetrics: AEOMetrics;
    aioMetrics: AIOMetrics;
    contentQualityMetrics: ContentQualityMetrics;
    
    keywordAnalysis: KeywordAnalysis;
    readabilityMetrics: ReadabilityMetrics;
    contentAnalysis: ContentAnalysis;
    entityAnalysis: EntityAnalysis;
    aiOptimization: AIOptimization;
    
    improvementSuggestions: string[];
    geoSuggestions: string[];
    aeoSuggestions: string[];
    aioSuggestions: string[];
};

export type GeneratedMetadata = {
    keywords: string[];
    tags: string[];
    targetAudience: string;
    suggestedTopics: string[];
    contentAngles: string[];
};

export type BioSummary = {
    summary: string;
    industry: string;
    expertise: string[];
    tone: string;
    targetAudience: string;
    uniqueSellingPoints: string[];
    contentPillars: string[];
};

// ========== CONTEXT TYPE ==========

interface AutoPostContextType {
    schedule: AutoPostSchedule | null;
    stats: AutoPostStats | null;
    loading: boolean;
    generatingSummary: boolean;
    generatingPreview: boolean;
    generatingMetadata: boolean;
    fetchSchedule: () => Promise<void>;
    fetchStats: () => Promise<void>;
    createSchedule: (data: Partial<AutoPostSchedule>) => Promise<AutoPostSchedule>;
    updateSchedule: (data: Partial<AutoPostSchedule>) => Promise<AutoPostSchedule>;
    toggleSchedule: (isActive: boolean) => Promise<void>;
    deleteSchedule: () => Promise<void>;
    generateSummary: () => Promise<BioSummary>;
    generatePreview: (config: Partial<AutoPostSchedule>) => Promise<{ generatedPost: GeneratedPostPreview }>;
    generateMetadata: (topics: string, targetCountry?: string | null, language?: string | null) => Promise<GeneratedMetadata>;
}

const AutoPostContext = createContext<AutoPostContextType | undefined>(undefined);

export const AutoPostProvider = ({ children }: { children: ReactNode }) => {
    const [schedule, setSchedule] = useState<AutoPostSchedule | null>(null);
    const [stats, setStats] = useState<AutoPostStats | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [generatingSummary, setGeneratingSummary] = useState<boolean>(false);
    const [generatingPreview, setGeneratingPreview] = useState<boolean>(false);
    const [generatingMetadata, setGeneratingMetadata] = useState<boolean>(false);
    const { signed } = useAuth();
    const { bio } = useBio();

    const fetchSchedule = async () => {
        if (!bio) return;
        setLoading(true);
        try {
            const response = await api.get(`/auto-post/${bio.id}`);
            setSchedule(response.data);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setSchedule(null);
            } else {
                console.error("Failed to fetch auto-post schedule", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!bio) return;
        setLoading(true);
        try {
            const response = await api.get(`/auto-post/${bio.id}/stats`);
            setStats(response.data);
            if (response.data.schedule) {
                setSchedule(response.data.schedule);
            }
        } catch (error) {
            console.error("Failed to fetch auto-post stats", error);
        } finally {
            setLoading(false);
        }
    };

    const createSchedule = async (data: Partial<AutoPostSchedule>): Promise<AutoPostSchedule> => {
        if (!bio) throw new Error("No bio selected");
        const response = await api.post("/auto-post", {
            ...data,
            bioId: bio.id,
        });
        setSchedule(response.data);
        return response.data;
    };

    const updateSchedule = async (data: Partial<AutoPostSchedule>): Promise<AutoPostSchedule> => {
        if (!bio) throw new Error("No bio selected");
        const response = await api.post("/auto-post", {
            ...data,
            bioId: bio.id,
        });
        setSchedule(response.data);
        return response.data;
    };

    const toggleSchedule = async (isActive: boolean) => {
        if (!bio) throw new Error("No bio selected");
        const response = await api.patch("/auto-post/toggle", {
            bioId: bio.id,
            isActive,
        });
        setSchedule(response.data);
    };

    const deleteSchedule = async () => {
        if (!bio) throw new Error("No bio selected");
        await api.delete(`/auto-post/${bio.id}`);
        setSchedule(null);
        setStats(null);
    };

    const generateSummary = async (): Promise<BioSummary> => {
        if (!bio) throw new Error("No bio selected");
        setGeneratingSummary(true);
        try {
            const response = await api.post("/auto-post/generate-summary", {
                bioId: bio.id,
            });
            if (response.data.schedule) {
                setSchedule(response.data.schedule);
            }
            return response.data.summary;
        } finally {
            setGeneratingSummary(false);
        }
    };

    const generatePreview = async (config: Partial<AutoPostSchedule>): Promise<{ generatedPost: GeneratedPostPreview }> => {
        if (!bio) throw new Error("No bio selected");
        setGeneratingPreview(true);
        try {
            const response = await api.post("/auto-post/preview", {
                bioId: bio.id,
                topics: config.topics,
                keywords: config.keywords,
                tone: config.tone,
                postLength: config.postLength,
                targetAudience: config.targetAudience,
                preferredTime: config.preferredTime,
                targetCountry: config.targetCountry,
                language: config.language,
            });
            return response.data;
        } finally {
            setGeneratingPreview(false);
        }
    };

    const generateMetadata = async (topics: string, targetCountry?: string | null, language?: string | null): Promise<GeneratedMetadata> => {
        if (!bio) throw new Error("No bio selected");
        setGeneratingMetadata(true);
        try {
            const response = await api.post("/auto-post/generate-metadata", {
                bioId: bio.id,
                topics,
                targetCountry,
                language,
            });
            return response.data.metadata;
        } finally {
            setGeneratingMetadata(false);
        }
    };

    useEffect(() => {
        if (signed && bio) {
            fetchStats();
        } else {
            setSchedule(null);
            setStats(null);
        }
    }, [signed, bio]);

    return (
        <AutoPostContext.Provider
            value={{
                schedule,
                stats,
                loading,
                generatingSummary,
                generatingPreview,
                generatingMetadata,
                fetchSchedule,
                fetchStats,
                createSchedule,
                updateSchedule,
                toggleSchedule,
                deleteSchedule,
                generateSummary,
                generatePreview,
                generateMetadata,
            }}
        >
            {children}
        </AutoPostContext.Provider>
    );
};

export const useAutoPost = () => {
    const context = useContext(AutoPostContext);
    if (context === undefined) {
        throw new Error("useAutoPost must be used within an AutoPostProvider");
    }
    return context;
};

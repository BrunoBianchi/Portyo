import type { MetaFunction } from "react-router";
import { useState, useEffect, useMemo } from "react";
import {
    Bot,
    Calendar,
    Check,
    ChevronDown,
    Clock,
    FileText,
    Loader2,
    Pause,
    Play,
    RefreshCw,
    Sparkles,
    Target,
    Trash2,
    Zap,
    AlertCircle,
    Eye,
    Edit3,
    TrendingUp,
    Brain,
    CalendarClock,
    BarChart3,
    Hash,
    Award,
    ChevronUp,
    Lightbulb,
    CheckCircle2,
    X,
    Mic,
    RotateCcw,
    Cpu
} from "lucide-react";
import { useAutoPost, type PostFrequency } from "~/contexts/auto-post.context";
import { useBio } from "~/contexts/bio.context";
import { useTranslation } from "react-i18next";
import { format, parseISO, isValid } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useUpgradePopup } from "~/hooks/use-upgrade-popup";
import { PLAN_LIMITS } from "~/constants/plan-limits";
import { SEOGEODashboard, ScoreBadge } from "~/components/dashboard/seo-geo-metrics";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { CountrySelector, getLanguageByCountry, COUNTRIES } from "~/components/dashboard/country-selector";

export const meta: MetaFunction = () => {
    return [
        { title: "Auto Post | Portyo" },
        { name: "description", content: "Configure automatic blog posts with AI" },
    ];
};

// Score color helpers
const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-lime-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
};

export default function DashboardAutoPost() {
    const { t, i18n } = useTranslation("dashboard");
    const { bio } = useBio();
    const {
        schedule,
        stats,
        loading,
        generatingSummary,
        generatingPreview,
        generatingMetadata,
        createSchedule,
        updateSchedule,
        toggleSchedule,
        deleteSchedule,
        generateSummary,
        generatePreview,
        generateMetadata,
    } = useAutoPost();
    const { showProFeaturePopup } = useUpgradePopup();

    const frequencies: { value: PostFrequency; label: string; description: string }[] = useMemo(
        () => [
            {
                value: "daily",
                label: t("dashboard.autoPost.frequencies.daily.label"),
                description: t("dashboard.autoPost.frequencies.daily.description"),
            },
            {
                value: "weekly",
                label: t("dashboard.autoPost.frequencies.weekly.label"),
                description: t("dashboard.autoPost.frequencies.weekly.description"),
            },
            {
                value: "biweekly",
                label: t("dashboard.autoPost.frequencies.biweekly.label"),
                description: t("dashboard.autoPost.frequencies.biweekly.description"),
            },
            {
                value: "monthly",
                label: t("dashboard.autoPost.frequencies.monthly.label"),
                description: t("dashboard.autoPost.frequencies.monthly.description"),
            },
        ],
        [t]
    );

    const tones = useMemo(
        () => [
            { value: "professional", label: t("dashboard.autoPost.tones.professional") },
            { value: "casual", label: t("dashboard.autoPost.tones.casual") },
            { value: "friendly", label: t("dashboard.autoPost.tones.friendly") },
            { value: "technical", label: t("dashboard.autoPost.tones.technical") },
            { value: "creative", label: t("dashboard.autoPost.tones.creative") },
            { value: "authoritative", label: t("dashboard.autoPost.tones.authoritative") },
        ],
        [t]
    );

    const postLengths = useMemo(
        () => [
            {
                value: "short",
                label: t("dashboard.autoPost.lengths.short.label"),
                description: t("dashboard.autoPost.lengths.short.description"),
            },
            {
                value: "medium",
                label: t("dashboard.autoPost.lengths.medium.label"),
                description: t("dashboard.autoPost.lengths.medium.description"),
            },
            {
                value: "long",
                label: t("dashboard.autoPost.lengths.long.label"),
                description: t("dashboard.autoPost.lengths.long.description"),
            },
        ],
        [t]
    );

    const [isEditing, setIsEditing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [showMetricsModal, setShowMetricsModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [showMetadataSuggestions, setShowMetadataSuggestions] = useState(false);
    const [metadataSuggestions, setMetadataSuggestions] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        frequency: "weekly" as PostFrequency,
        topics: "",
        keywords: "",
        targetAudience: "",
        tone: "professional",
        postLength: "medium",
        preferredTime: "09:00",
        startDate: "",
        isActive: true,
        targetCountry: null as string | null,
        language: null as string | null,
    });

    // Debounce timer for topics input
    const [topicsDebounceTimer, setTopicsDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Initialize form from existing schedule
    useEffect(() => {
        if (schedule) {
            setFormData({
                frequency: schedule.frequency,
                topics: schedule.topics || "",
                keywords: schedule.keywords?.join(", ") || "",
                targetAudience: schedule.targetAudience || "",
                tone: schedule.tone,
                postLength: schedule.postLength,
                preferredTime: schedule.preferredTime || "09:00",
                startDate: schedule.startDate ? schedule.startDate.split("T")[0] : "",
                isActive: schedule.isActive,
                targetCountry: schedule.targetCountry || null,
                language: schedule.language || null,
            });
        }
    }, [schedule]);

    const handleSave = async () => {
        try {
            const data = {
                frequency: formData.frequency,
                topics: formData.topics,
                keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
                targetAudience: formData.targetAudience,
                tone: formData.tone,
                postLength: formData.postLength,
                preferredTime: formData.preferredTime,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                isActive: formData.isActive,
                targetCountry: formData.targetCountry,
                language: formData.language,
            };

            if (schedule) {
                await updateSchedule(data);
            } else {
                await createSchedule(data);
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save schedule", error);
        }
    };

    const handleToggle = async () => {
        try {
            await toggleSchedule(!schedule?.isActive);
        } catch (error) {
            console.error("Failed to toggle schedule", error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t("dashboard.autoPost.confirmDelete"))) return;
        try {
            await deleteSchedule();
        } catch (error) {
            console.error("Failed to delete schedule", error);
        }
    };

    const handleGeneratePreview = async () => {
        try {
            const result = await generatePreview({
                frequency: formData.frequency,
                topics: formData.topics,
                keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
                tone: formData.tone,
                postLength: formData.postLength,
                targetAudience: formData.targetAudience,
                preferredTime: formData.preferredTime,
                targetCountry: formData.targetCountry,
                language: formData.language,
            });
            setPreviewData(result.generatedPost);
            setShowPreview(true);
        } catch (error) {
            console.error("Failed to generate preview", error);
        }
    };

    const handleGenerateSummary = async () => {
        try {
            await generateSummary();
        } catch (error) {
            console.error("Failed to generate summary", error);
        }
    };

    const handleViewMetrics = (log: any) => {
        setSelectedLog(log);
        setShowMetricsModal(true);
    };

    const handleTopicsChange = (value: string) => {
        setFormData(prev => ({ ...prev, topics: value }));

        if (topicsDebounceTimer) {
            clearTimeout(topicsDebounceTimer);
        }

        if (value.length >= 20 && (isEditing || !schedule)) {
            const timer = setTimeout(async () => {
                try {
                    const metadata = await generateMetadata(
                        value,
                        formData.targetCountry,
                        formData.language
                    );
                    setMetadataSuggestions(metadata);
                    setShowMetadataSuggestions(true);
                } catch (error) {
                    console.error("Failed to generate metadata:", error);
                }
            }, 1500);

            setTopicsDebounceTimer(timer);
        }
    };

    const applyMetadata = (metadata: any) => {
        setFormData(prev => ({
            ...prev,
            keywords: metadata.keywords?.join(", ") || prev.keywords,
            targetAudience: metadata.targetAudience || prev.targetAudience,
        }));
        setShowMetadataSuggestions(false);
    };

    const locale = i18n.language === "pt" ? ptBR : enUS;

    if (!bio) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="bg-white border-4 border-black rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
                    <Bot className="w-16 h-16 text-black mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        {t("dashboard.autoPost.emptyBioTitle")}
                    </h2>
                    <p className="text-gray-500 font-medium">{t("dashboard.autoPost.emptyBioSubtitle")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d2e823] border border-black text-black text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles className="w-3 h-3" />
                        {t("dashboard.autoPost.header.proFeature")}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        {t("dashboard.autoPost.header.title")}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl">{t("dashboard.autoPost.header.subtitle")}</p>
                </div>

                {schedule && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggle}
                            className={`px-6 py-3 rounded-[14px] font-black text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 ${schedule.isActive
                                    ? 'bg-[#E94E77] text-white hover:bg-[#d43d64]'
                                    : 'bg-[#C6F035] text-black hover:bg-[#d6ed42]'
                                }`}
                        >
                            {schedule.isActive ? (
                                <><Pause className="w-4 h-4 stroke-[2.5px]" /> {t("dashboard.autoPost.header.pause")}</>
                            ) : (
                                <><Play className="w-4 h-4 stroke-[2.5px]" /> {t("dashboard.autoPost.header.resume")}</>
                            )}
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-3 bg-white text-black border-2 border-black rounded-[14px] font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4 stroke-[2.5px]" />
                            {isEditing ? t("dashboard.autoPost.header.cancelEdit") : t("dashboard.autoPost.header.edit")}
                        </button>
                    </div>
                )}
            </header>

            {/* Enhanced Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Posts This Month */}
                    <div className="bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-[14px] bg-[#0047FF] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500">{t("dashboard.autoPost.stats.postsThisMonth")}</p>
                                <p className="text-2xl font-black text-[#1A1A1A]">{stats.postsThisMonth}</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg w-fit border border-gray-200">
                            {t("dashboard.autoPost.stats.remainingOf", {
                                remaining: stats.remainingPosts,
                                limit: PLAN_LIMITS.pro.autoPostPerMonth,
                            })}
                        </div>
                    </div>

                    {/* Next Post */}
                    <div className="bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-[14px] bg-[#C6F035] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Calendar className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500">{t("dashboard.autoPost.stats.nextPost")}</p>
                                <p className="text-xl font-black text-[#1A1A1A]">
                                    {stats.nextPostDate
                                        ? (() => {
                                            const nextDate = new Date(stats.nextPostDate);
                                            const today = new Date();
                                            const isToday = nextDate.toDateString() === today.toDateString();
                                            return isToday ? t("dashboard.autoPost.stats.today") : format(nextDate, "MMM d", { locale });
                                        })()
                                        : t("dashboard.autoPost.stats.notScheduled")
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-400">
                            {stats.nextPostDate
                                ? format(new Date(stats.nextPostDate), "h:mm a", { locale })
                                : (schedule?.preferredTime || "--")
                            }
                            {stats.nextPostDate && new Date(stats.nextPostDate) < new Date() && (
                                <span className="text-[#E94E77] ml-2">({t("dashboard.autoPost.stats.overdue")})</span>
                            )}
                        </div>
                    </div>

                    {/* Last Post */}
                    <div className="bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-[14px] bg-[#E94E77] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <RotateCcw className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500">{t("dashboard.autoPost.stats.lastPost")}</p>
                                <p className="text-xl font-black text-[#1A1A1A]">
                                    {stats.lastPostDate
                                        ? (() => {
                                            const lastDate = new Date(stats.lastPostDate);
                                            const today = new Date();
                                            const isToday = lastDate.toDateString() === today.toDateString();
                                            return isToday ? t("dashboard.autoPost.stats.today") : format(lastDate, "MMM d", { locale });
                                        })()
                                        : t("dashboard.autoPost.stats.never")
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-400">
                            {stats.lastPostDate
                                ? format(new Date(stats.lastPostDate), "h:mm a", { locale })
                                : t("dashboard.autoPost.stats.noPostsYet")
                            }
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white p-6 rounded-[24px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-[14px] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${schedule?.isActive ? 'bg-[#d2e823]' : 'bg-gray-200'
                                }`}>
                                <Zap className={`w-6 h-6 ${schedule?.isActive ? 'text-black' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500">{t("dashboard.autoPost.stats.status")}</p>
                                <p className="text-xl font-black text-[#1A1A1A]">
                                    {schedule?.isActive ? t("dashboard.autoPost.stats.active") : t("dashboard.autoPost.stats.paused")}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-400 capitalize bg-gray-100 px-3 py-1.5 rounded-lg w-fit border border-gray-200">
                            {schedule?.frequency || t("dashboard.autoPost.stats.notConfigured")}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[24px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-8 border-b-4 border-black bg-gray-50">
                            <h2 className="text-2xl font-black text-[#1A1A1A] flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                                <div className="p-2 bg-[#d2e823] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Target className="w-5 h-5 text-black" />
                                </div>
                                {t("dashboard.autoPost.config.title")}
                            </h2>
                            <p className="text-base font-medium text-gray-500 mt-2">
                                {t("dashboard.autoPost.config.subtitle")}
                            </p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Frequency, Time & Start Date */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.postFrequency")}
                                    </label>
                                    <div className="space-y-3">
                                        {frequencies.map((freq) => (
                                            <button
                                                key={freq.value}
                                                disabled={!isEditing && !!schedule}
                                                onClick={() => setFormData({ ...formData, frequency: freq.value })}
                                                className={`w-full p-4 rounded-[14px] border-2 text-left transition-all ${formData.frequency === freq.value
                                                        ? 'border-black bg-[#C6F035] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                                        : 'border-gray-200 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                    } ${(!isEditing && !!schedule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-black text-[#1A1A1A]">{freq.label}</div>
                                                <div className="text-xs font-medium text-gray-600 mt-1">{freq.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.postingTime")}
                                    </label>
                                    <div className="relative mb-6">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="time"
                                            value={formData.preferredTime}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 rounded-[14px] border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-400 font-bold"
                                        />
                                    </div>

                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.startDateOptional")}
                                    </label>
                                    <div className="relative">
                                        <CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 rounded-[14px] border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-400 font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.postLength")}
                                    </label>
                                    <div className="space-y-3">
                                        {postLengths.map((length) => (
                                            <button
                                                key={length.value}
                                                disabled={!isEditing && !!schedule}
                                                onClick={() => setFormData({ ...formData, postLength: length.value })}
                                                className={`w-full p-4 rounded-[14px] border-2 text-left transition-all ${formData.postLength === length.value
                                                        ? 'border-black bg-[#C6F035] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                                        : 'border-gray-200 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                    } ${(!isEditing && !!schedule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-black text-[#1A1A1A]">{length.label}</div>
                                                <div className="text-xs font-medium text-gray-600 mt-1">{length.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Topics */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider flex items-center justify-between">
                                    <span>{t("dashboard.autoPost.config.topicsLabel")}</span>
                                    {generatingMetadata && (
                                        <span className="ml-2 text-xs text-[#0047FF] font-bold inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {t("dashboard.autoPost.config.aiAnalyzing")}
                                        </span>
                                    )}
                                </label>
                                <textarea
                                    value={formData.topics}
                                    disabled={!isEditing && !!schedule}
                                    onChange={(e) => handleTopicsChange(e.target.value)}
                                    placeholder={t("dashboard.autoPost.config.topicsPlaceholder")}
                                    className="w-full px-5 py-4 rounded-[16px] border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none h-32 disabled:bg-gray-100 disabled:text-gray-500 font-medium placeholder:text-gray-400"
                                />

                                {/* Metadata Suggestions Modal */}
                                {showMetadataSuggestions && metadataSuggestions && (
                                    <div className="absolute z-10 mt-2 w-full bg-white border-4 border-black rounded-[20px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-in fade-in slide-in-from-top-4 duration-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-[#C6F035] fill-black" />
                                                {t("dashboard.autoPost.config.aiSuggestionsTitle")}
                                            </h4>
                                            <button
                                                onClick={() => setShowMetadataSuggestions(false)}
                                                className="text-gray-400 hover:text-black transition-colors"
                                            >
                                                <X className="w-5 h-5 stroke-[3px]" />
                                            </button>
                                        </div>

                                        {metadataSuggestions.keywords?.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("dashboard.autoPost.config.suggestedKeywords")}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {metadataSuggestions.keywords.slice(0, 8).map((kw: string, i: number) => (
                                                        <span key={i} className="px-3 py-1 bg-[#d2e823]/20 border border-[#d2e823] text-black text-xs font-bold rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {metadataSuggestions.targetAudience && (
                                            <div className="mb-6">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("dashboard.autoPost.config.targetAudience")}</p>
                                                <p className="text-sm font-medium text-[#1A1A1A] bg-gray-50 p-3 rounded-xl border border-gray-200">{metadataSuggestions.targetAudience}</p>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => applyMetadata(metadataSuggestions)}
                                                className="flex-1 px-4 py-3 bg-[#1A1A1A] text-white border-2 border-black rounded-[12px] font-black text-sm hover:translate-x-[1px] hover:translate-y-[1px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4 stroke-[3px]" />
                                                {t("dashboard.autoPost.config.applySuggestions")}
                                            </button>
                                            <button
                                                onClick={() => setShowMetadataSuggestions(false)}
                                                className="px-6 py-3 bg-white text-black border-2 border-black rounded-[12px] font-bold text-sm hover:bg-gray-50 flex items-center justify-center"
                                            >
                                                {t("dashboard.autoPost.config.ignore")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider flex items-center justify-between">
                                    <span>{t("dashboard.autoPost.config.seoKeywords")}</span>
                                    {metadataSuggestions?.keywords && formData.keywords === metadataSuggestions.keywords.join(", ") && (
                                        <span className="text-xs text-black font-bold flex items-center gap-1 bg-[#d2e823] px-2 py-0.5 rounded border border-black">
                                            <Sparkles className="w-3 h-3" />
                                            {t("dashboard.autoPost.config.aiGenerated")}
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={formData.keywords}
                                    disabled={!isEditing && !!schedule}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                    placeholder={t("dashboard.autoPost.config.keywordsPlaceholder")}
                                    className="w-full px-5 py-4 rounded-[16px] border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-500 font-medium placeholder:text-gray-400"
                                />
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Tone */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.writingTone")}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.tone}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                            className="w-full px-5 py-4 rounded-[16px] border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-500 font-bold appearance-none cursor-pointer"
                                        >
                                            {tones.map((tone) => (
                                                <option key={tone.value} value={tone.value}>
                                                    {tone.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none stroke-[3px]" />
                                    </div>
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider flex items-center justify-between">
                                        <span>{t("dashboard.autoPost.config.targetAudienceLabel")}</span>
                                        {metadataSuggestions?.targetAudience && formData.targetAudience === metadataSuggestions.targetAudience && (
                                            <span className="text-xs text-black font-bold flex items-center gap-1 bg-[#d2e823] px-2 py-0.5 rounded border border-black">
                                                <Sparkles className="w-3 h-3" />
                                                {t("dashboard.autoPost.config.aiGenerated")}
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.targetAudience}
                                        disabled={!isEditing && !!schedule}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        placeholder={t("dashboard.autoPost.config.targetAudiencePlaceholder")}
                                        className="w-full px-5 py-4 rounded-[16px] border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-500 font-medium placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Target Country & Language */}
                            <div>
                                <label className="block text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">
                                    {t("dashboard.autoPost.config.geoTargetLabel")}
                                </label>
                                <CountrySelector
                                    selectedCountry={formData.targetCountry}
                                    onSelectCountry={(country) => {
                                        const langInfo = getLanguageByCountry(country);
                                        setFormData({
                                            ...formData,
                                            targetCountry: country,
                                            language: langInfo ? langInfo.language : null
                                        });
                                    }}
                                    disabled={!isEditing && !!schedule}
                                />
                                <div className="flex items-center gap-2 mt-3">
                                    <p className="text-xs font-bold text-gray-500">
                                        {formData.targetCountry ? (
                                            t("dashboard.autoPost.config.targetLanguage", {
                                                target: COUNTRIES.find(c => c.code === formData.targetCountry)?.name,
                                                language: COUNTRIES.find(c => c.code === formData.targetCountry)?.language,
                                            })
                                        ) : (
                                            t("dashboard.autoPost.config.geoTargetEmpty")
                                        )}
                                    </p>
                                    {(!isEditing && !!schedule) && (
                                        <span className="text-xs font-bold text-[#E94E77]">({t("dashboard.autoPost.config.editToChange")})</span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing || !schedule ? (
                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-100">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="btn-primary flex-1 py-4 text-base"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> {t("dashboard.autoPost.actions.saving")}</>
                                        ) : (
                                            <><Check className="w-5 h-5 stroke-[3px]" /> {schedule ? t("dashboard.autoPost.actions.saveUpdate") : t("dashboard.autoPost.actions.saveCreate")}</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleGeneratePreview}
                                        disabled={generatingPreview}
                                        className="btn-secondary py-4 text-base"
                                    >
                                        {generatingPreview ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> {t("dashboard.autoPost.actions.generating")}</>
                                        ) : (
                                            <><Eye className="w-5 h-5 stroke-[3px]" /> {t("dashboard.autoPost.actions.previewWithMetrics")}</>
                                        )}
                                    </button>
                                    {schedule && (
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-4 bg-white text-black border-2 border-black rounded-[14px] font-black hover:bg-gray-50 transition-all text-base"
                                        >
                                            {t("dashboard.autoPost.actions.cancel")}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
                                    <button
                                        onClick={handleGeneratePreview}
                                        disabled={generatingPreview}
                                        className="flex-1 btn-secondary py-4 text-base"
                                    >
                                        {generatingPreview ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> {t("dashboard.autoPost.actions.generating")}</>
                                        ) : (
                                            <><Eye className="w-5 h-5 stroke-[3px]" /> {t("dashboard.autoPost.actions.previewNextPost")}</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-6 py-4 bg-red-600 text-white border-2 border-black rounded-[14px] font-black hover:bg-red-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-base flex items-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5 stroke-[2.5px]" /> {t("dashboard.autoPost.actions.delete")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio Summary */}
                    {schedule?.bioSummary && (
                        <div className="bg-white rounded-[24px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-[#1A1A1A] flex items-center gap-2 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Bot className="w-6 h-6 text-black" />
                                    {t("dashboard.autoPost.bioSummary.title")}
                                </h3>
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={generatingSummary}
                                    className="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    <RefreshCw className={`w-4 h-4 ${generatingSummary ? 'animate-spin' : ''}`} />
                                    {t("dashboard.autoPost.bioSummary.refresh")}
                                </button>
                            </div>
                            <p className="text-sm font-medium text-gray-600 bg-gray-50 p-6 rounded-[16px] border-2 border-gray-100 leading-relaxed">
                                {schedule.bioSummary}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Posts with Metrics */}
                    <div className="bg-white rounded-[24px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-6 border-b-4 border-black bg-gray-50 flex items-center justify-between">
                            <h3 className="font-black text-[#1A1A1A] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                <BarChart3 className="w-5 h-5 text-black" />
                                {t("dashboard.autoPost.sidebar.recentAutoPosts")}
                            </h3>
                        </div>
                        <div className="divide-y-2 divide-gray-100">
                            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                                stats.recentLogs.map((log) => (
                                    <div key={log.id} className="p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-3 h-3 rounded-full mt-2 border border-black ${log.status === 'published' ? 'bg-[#C6F035]' :
                                                    log.status === 'failed' ? 'bg-[#E94E77]' : 'bg-yellow-400'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[#1A1A1A] text-sm truncate mb-1">
                                                    {log.generatedTitle}
                                                </p>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                                    {format(new Date(log.createdAt), "MMM d, yyyy", { locale })}
                                                </p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {log.seoScore && (
                                                        <ScoreBadge score={log.seoScore} label="SEO" />
                                                    )}
                                                    {log.geoScore && (
                                                        <ScoreBadge score={log.geoScore} label="GEO" />
                                                    )}
                                                    <button
                                                        onClick={() => handleViewMetrics(log)}
                                                        className="text-xs font-black text-black underline hover:no-underline ml-auto"
                                                    >
                                                        {t("dashboard.autoPost.sidebar.viewDetails")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 font-medium text-sm">
                                    {t("dashboard.autoPost.sidebar.noAutoPosts")}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-[#1A1A1A] rounded-[24px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] p-6 text-white">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-[#d2e823] rounded-lg text-black shrink-0">
                                <Lightbulb className="w-5 h-5 fill-black" />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-base mb-3" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.autoPost.info.title")}</h4>
                                <ul className="text-sm text-gray-300 space-y-3 font-medium">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-[#C6F035] mt-1 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet1")}
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-[#C6F035] mt-1 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet2")}
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-[#C6F035] mt-1 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet3")}
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-[#C6F035] mt-1 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet4")}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal with Metrics */}
            {showPreview && previewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-hidden border-4 border-black flex flex-col">
                        <div className="p-5 md:p-8 border-b-4 border-black flex items-center justify-between gap-4 bg-gray-50 shrink-0">
                            <div className="min-w-0">
                                <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] truncate flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Eye className="w-6 h-6 text-black" />
                                    {t("dashboard.autoPost.preview.title")}
                                </h3>
                                <p className="text-sm font-bold text-gray-500 hidden sm:block mt-1">
                                    {t("dashboard.autoPost.preview.subtitle")}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-3 bg-white border-2 border-black rounded-[12px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                            >
                                <X className="w-6 h-6 stroke-[3px]" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <div className="h-full flex flex-col xl:flex-row">
                                {/* Left: Content Preview */}
                                <div className="flex-1 overflow-y-auto p-8 xl:border-r-4 border-black bg-white">
                                    <div className="mb-8 p-6 bg-gray-50 rounded-[24px] border-2 border-gray-100">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <ScoreBadge score={previewData.seoMetrics.seoScore} label="SEO" />
                                            <ScoreBadge score={previewData.geoMetrics.geoScore} label="GEO" />
                                            {previewData.aeoMetrics && (
                                                <ScoreBadge score={previewData.aeoMetrics.aeoScore} label="AEO" />
                                            )}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                            {previewData.title}
                                        </h2>
                                        <p className="text-base font-medium text-gray-600 leading-relaxed">
                                            {previewData.metaDescription}
                                        </p>
                                    </div>
                                    <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:font-display prose-p:font-medium prose-p:text-gray-600">
                                        <MarkdownRenderer content={previewData.content} />
                                    </div>
                                </div>

                                {/* Right: Metrics Dashboard */}
                                <div className="xl:w-[450px] bg-gray-50 overflow-y-auto p-8 border-t-4 xl:border-t-0 border-black shrink-0">
                                    <h3 className="text-lg font-black text-[#1A1A1A] mb-6 uppercase tracking-wider flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Metrics Analysis
                                    </h3>
                                    <SEOGEODashboard metrics={previewData} variant="full" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 border-t-4 border-black bg-white flex flex-col sm:flex-row justify-end gap-4 shrink-0">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="btn-secondary w-full sm:w-auto py-4 text-base"
                            >
                                {t("dashboard.autoPost.preview.close")}
                            </button>
                            {!schedule && (
                                <button
                                    onClick={handleSave}
                                    className="btn-primary w-full sm:w-auto py-4 text-base"
                                >
                                    <Check className="w-5 h-5 stroke-[3px]" />
                                    {t("dashboard.autoPost.preview.createSchedule")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Detail Modal for Historical Posts */}
            {showMetricsModal && selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-4 border-black flex flex-col">
                        <div className="p-6 md:p-8 border-b-4 border-black bg-gray-50 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.autoPost.metricsModal.title")}</h3>
                                <p className="text-sm font-bold text-gray-500 mt-1">{selectedLog.generatedTitle}</p>
                            </div>
                            <button
                                onClick={() => setShowMetricsModal(false)}
                                className="p-3 bg-white border-2 border-black rounded-[12px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                            >
                                <X className="w-6 h-6 stroke-[3px]" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-[#1A1A1A] p-5 rounded-[20px] text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                    <p className={`text-4xl font-black text-[#C6F035]`}>
                                        {selectedLog.seoScore || "--"}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.seoScore")}</p>
                                </div>
                                <div className="bg-[#1A1A1A] p-5 rounded-[20px] text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                    <p className={`text-4xl font-black text-[#0047FF]`}>
                                        {selectedLog.geoScore || "--"}
                                    </p>
                                    <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.geoScore")}</p>
                                </div>
                                <div className="bg-white p-5 rounded-[20px] text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <p className={`text-4xl font-black text-black`}>
                                        {selectedLog.readabilityScore || "--"}
                                    </p>
                                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.readability")}</p>
                                </div>
                                <div className="bg-white p-5 rounded-[20px] text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-4xl font-black text-black">
                                        {selectedLog.contentAnalysis?.wordCount || "--"}
                                    </p>
                                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.words")}</p>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="space-y-6">
                                {selectedLog.keywordAnalysis && (
                                    <div className="bg-white p-6 rounded-[20px] border-2 border-black">
                                        <h4 className="font-black text-[#1A1A1A] mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                                            <Hash className="w-4 h-4" />
                                            {t("dashboard.autoPost.metricsModal.keywords")}
                                        </h4>
                                        <p className="text-sm font-bold text-[#1A1A1A] mb-3">
                                            {t("dashboard.autoPost.metricsModal.primary")}: <span className="bg-[#C6F035] px-2 py-0.5 rounded border border-black">{selectedLog.keywordAnalysis.primaryKeyword}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLog.keywordAnalysis.secondaryKeywords?.map((kw: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedLog.improvementSuggestions?.length > 0 && (
                                    <div className="bg-[#fff9db] p-6 rounded-[20px] border-2 border-black">
                                        <h4 className="font-black text-[#1A1A1A] mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                                            <Lightbulb className="w-4 h-4 text-black fill-[#C6F035]" />
                                            {t("dashboard.autoPost.metricsModal.seoSuggestions")}
                                        </h4>
                                        <ul className="space-y-3">
                                            {selectedLog.improvementSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-sm font-medium text-[#1A1A1A] flex items-start gap-3">
                                                    <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedLog.geoSuggestions?.length > 0 && (
                                    <div className="bg-[#f0f4ff] p-6 rounded-[20px] border-2 border-black">
                                        <h4 className="font-black text-[#1A1A1A] mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                                            <Brain className="w-4 h-4 text-[#0047FF]" />
                                            {t("dashboard.autoPost.metricsModal.geoSuggestions")}
                                        </h4>
                                        <ul className="space-y-3">
                                            {selectedLog.geoSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-sm font-medium text-[#1A1A1A] flex items-start gap-3">
                                                    <Sparkles className="w-4 h-4 text-[#0047FF] shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t-4 border-black bg-white flex justify-end shrink-0">
                            <button
                                onClick={() => setShowMetricsModal(false)}
                                className="px-8 py-3 bg-[#1A1A1A] text-white border-2 border-black rounded-[12px] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all"
                            >
                                {t("dashboard.autoPost.metricsModal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

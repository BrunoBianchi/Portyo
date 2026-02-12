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
    Cpu,
    Globe,
    PenTool
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

    const parsedKeywords = formData.keywords
        .split(",")
        .map(k => k.trim())
        .filter(k => k);

    const isFormComplete =
        !!formData.frequency &&
        !!formData.topics.trim() &&
        parsedKeywords.length > 0 &&
        !!formData.tone &&
        !!formData.postLength &&
        !!formData.preferredTime &&
        !!formData.targetCountry &&
        !!formData.language;

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
        if (!isFormComplete) {
            return;
        }

        try {
            const data = {
                frequency: formData.frequency,
                topics: formData.topics,
                keywords: parsedKeywords,
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
        if (!isFormComplete) {
            return;
        }

        try {
            const result = await generatePreview({
                frequency: formData.frequency,
                topics: formData.topics,
                keywords: parsedKeywords,
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white to-gray-50 border-4 border-black rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-[#d2e823] border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Bot className="w-10 h-10 text-black" />
                    </div>
                    <h2 className="text-2xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        {t("dashboard.autoPost.emptyBioTitle")}
                    </h2>
                    <p className="text-gray-500 font-medium">{t("dashboard.autoPost.emptyBioSubtitle")}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#d2e823] to-[#C6F035] border-2 border-black text-black text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t("dashboard.autoPost.header.proFeature")}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                        {t("dashboard.autoPost.header.title")}
                    </h1>
                    <p className="text-base text-gray-500 font-medium max-w-xl">{t("dashboard.autoPost.header.subtitle")}</p>
                </div>

                {schedule && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                    >
                        <button
                            onClick={handleToggle}
                            className={`px-5 py-2.5 rounded-[12px] font-black text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 ${schedule.isActive
                                    ? 'bg-[#E94E77] text-white'
                                    : 'bg-[#C6F035] text-black'
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
                            className="px-5 py-2.5 bg-white text-black border-2 border-black rounded-[12px] font-black text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4 stroke-[2.5px]" />
                            {isEditing ? t("dashboard.autoPost.header.cancelEdit") : t("dashboard.autoPost.header.edit")}
                        </button>
                    </motion.div>
                )}
            </motion.header>

            {/* Enhanced Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {/* Posts This Month */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white p-5 rounded-[20px] border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#0047FF] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">{t("dashboard.autoPost.stats.postsThisMonth")}</p>
                        </div>
                        <p className="text-3xl font-black text-[#1A1A1A] mb-2">{stats.postsThisMonth}</p>
                        <div className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg w-fit border border-gray-200">
                            {t("dashboard.autoPost.stats.remainingOf", {
                                remaining: stats.remainingPosts,
                                limit: PLAN_LIMITS.pro.autoPostPerMonth,
                            })}
                        </div>
                    </motion.div>

                    {/* Next Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-5 rounded-[20px] border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#C6F035] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Calendar className="w-5 h-5 text-black" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">{t("dashboard.autoPost.stats.nextPost")}</p>
                        </div>
                        <p className="text-xl font-black text-[#1A1A1A] mb-2">
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
                        <div className="text-[11px] font-bold text-gray-400">
                            {stats.nextPostDate
                                ? format(new Date(stats.nextPostDate), "h:mm a", { locale })
                                : (schedule?.preferredTime || "--")
                            }
                            {stats.nextPostDate && new Date(stats.nextPostDate) < new Date() && (
                                <span className="text-[#E94E77] ml-1.5 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">({t("dashboard.autoPost.stats.overdue")})</span>
                            )}
                        </div>
                    </motion.div>

                    {/* Last Post */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white p-5 rounded-[20px] border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[#E94E77] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <RotateCcw className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">{t("dashboard.autoPost.stats.lastPost")}</p>
                        </div>
                        <p className="text-xl font-black text-[#1A1A1A] mb-2">
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
                        <div className="text-[11px] font-bold text-gray-400">
                            {stats.lastPostDate
                                ? format(new Date(stats.lastPostDate), "h:mm a", { locale })
                                : t("dashboard.autoPost.stats.noPostsYet")
                            }
                        </div>
                    </motion.div>

                    {/* Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-5 rounded-[20px] border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-[12px] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${schedule?.isActive ? 'bg-[#d2e823]' : 'bg-gray-200'
                                }`}>
                                <Zap className={`w-5 h-5 ${schedule?.isActive ? 'text-black' : 'text-gray-500'}`} />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">{t("dashboard.autoPost.stats.status")}</p>
                        </div>
                        <p className="text-xl font-black text-[#1A1A1A] mb-2">
                            {schedule?.isActive ? t("dashboard.autoPost.stats.active") : t("dashboard.autoPost.stats.paused")}
                        </p>
                        <div className="text-[11px] font-bold text-gray-400 capitalize bg-gray-100 px-2.5 py-1 rounded-lg w-fit border border-gray-200">
                            {schedule?.frequency || t("dashboard.autoPost.stats.notConfigured")}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="bg-white rounded-[20px] border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-6 md:p-7 border-b-3 border-black bg-gradient-to-r from-gray-50 to-white">
                            <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                                <div className="p-2 bg-gradient-to-br from-[#d2e823] to-[#C6F035] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Target className="w-5 h-5 text-black" />
                                </div>
                                {t("dashboard.autoPost.config.title")}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 mt-1.5">
                                {t("dashboard.autoPost.config.subtitle")}
                            </p>
                        </div>

                        <div className="p-6 md:p-7 space-y-7">
                            {/* Frequency, Time & Start Date */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.postFrequency")}
                                        <span className="text-[#E94E77] ml-1">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {frequencies.map((freq) => (
                                            <button
                                                key={freq.value}
                                                disabled={!isEditing && !!schedule}
                                                onClick={() => setFormData({ ...formData, frequency: freq.value })}
                                                className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${formData.frequency === freq.value
                                                        ? 'border-black bg-[#C6F035] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                        : 'border-gray-200 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                    } ${(!isEditing && !!schedule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-black text-sm text-[#1A1A1A]">{freq.label}</div>
                                                <div className="text-[11px] font-medium text-gray-500 mt-0.5">{freq.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.postingTime")}
                                        <span className="text-[#E94E77] ml-1">*</span>
                                    </label>
                                    <div className="relative mb-5">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="time"
                                            value={formData.preferredTime}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-[12px] border-2 border-black bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-400 font-bold text-sm"
                                        />
                                    </div>

                                    <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.startDateOptional")}
                                    </label>
                                    <div className="relative">
                                        <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-[12px] border-2 border-black bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-400 font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.postLength")}
                                        <span className="text-[#E94E77] ml-1">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {postLengths.map((length) => (
                                            <button
                                                key={length.value}
                                                disabled={!isEditing && !!schedule}
                                                onClick={() => setFormData({ ...formData, postLength: length.value })}
                                                className={`w-full p-3 rounded-[12px] border-2 text-left transition-all ${formData.postLength === length.value
                                                        ? 'border-black bg-[#C6F035] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                        : 'border-gray-200 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                    } ${(!isEditing && !!schedule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-black text-sm text-[#1A1A1A]">{length.label}</div>
                                                <div className="text-[11px] font-medium text-gray-500 mt-0.5">{length.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Topics */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <PenTool className="w-3.5 h-3.5 text-gray-400" />
                                        {t("dashboard.autoPost.config.topicsLabel")}
                                        <span className="text-[#E94E77]">*</span>
                                    </span>
                                    {generatingMetadata && (
                                        <span className="text-[11px] text-[#0047FF] font-bold inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
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
                                    className="w-full px-4 py-3.5 rounded-[14px] border-2 border-black bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all resize-none h-28 disabled:bg-gray-100 disabled:text-gray-500 font-medium text-sm placeholder:text-gray-400"
                                />

                                {/* Metadata Suggestions Modal */}
                                <AnimatePresence>
                                {showMetadataSuggestions && metadataSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute z-10 mt-2 w-full bg-white border-3 border-black rounded-[16px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-[#C6F035] fill-black" />
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
                                            <div className="mb-3">
                                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t("dashboard.autoPost.config.suggestedKeywords")}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {metadataSuggestions.keywords.slice(0, 8).map((kw: string, i: number) => (
                                                        <span key={i} className="px-2.5 py-0.5 bg-[#d2e823]/20 border border-[#d2e823] text-black text-[11px] font-bold rounded-lg">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {metadataSuggestions.targetAudience && (
                                            <div className="mb-4">
                                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t("dashboard.autoPost.config.targetAudience")}</p>
                                                <p className="text-xs font-medium text-[#1A1A1A] bg-gray-50 p-2.5 rounded-xl border border-gray-200">{metadataSuggestions.targetAudience}</p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => applyMetadata(metadataSuggestions)}
                                                className="flex-1 px-3 py-2.5 bg-[#1A1A1A] text-white border-2 border-black rounded-[10px] font-black text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                {t("dashboard.autoPost.config.applySuggestions")}
                                            </button>
                                            <button
                                                onClick={() => setShowMetadataSuggestions(false)}
                                                className="px-4 py-2.5 bg-white text-black border-2 border-black rounded-[10px] font-bold text-xs hover:bg-gray-50 flex items-center justify-center"
                                            >
                                                {t("dashboard.autoPost.config.ignore")}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                                        {t("dashboard.autoPost.config.seoKeywords")}
                                        <span className="text-[#E94E77]">*</span>
                                    </span>
                                    {metadataSuggestions?.keywords && formData.keywords === metadataSuggestions.keywords.join(", ") && (
                                        <span className="text-[10px] text-black font-bold flex items-center gap-1 bg-[#d2e823] px-1.5 py-0.5 rounded border border-black">
                                            <Sparkles className="w-2.5 h-2.5" />
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
                                    className="w-full px-4 py-3.5 rounded-[14px] border-2 border-black bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-500 font-medium text-sm placeholder:text-gray-400"
                                />
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tone */}
                                <div>
                                    <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider">
                                        {t("dashboard.autoPost.config.writingTone")}
                                        <span className="text-[#E94E77] ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.tone}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                            className="w-full px-4 py-3.5 rounded-[14px] border-2 border-black bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-500 font-bold text-sm appearance-none cursor-pointer"
                                        >
                                            {tones.map((tone) => (
                                                <option key={tone.value} value={tone.value}>
                                                    {tone.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none stroke-[3px]" />
                                    </div>
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider flex items-center justify-between">
                                        <span>{t("dashboard.autoPost.config.targetAudienceLabel")}</span>
                                        {metadataSuggestions?.targetAudience && formData.targetAudience === metadataSuggestions.targetAudience && (
                                            <span className="text-[10px] text-black font-bold flex items-center gap-1 bg-[#d2e823] px-1.5 py-0.5 rounded border border-black">
                                                <Sparkles className="w-2.5 h-2.5" />
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
                                        className="w-full px-4 py-3.5 rounded-[14px] border-2 border-black bg-white focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:bg-gray-100 disabled:text-gray-500 font-medium text-sm placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Target Country & Language */}
                            <div>
                                <label className="block text-xs font-bold text-[#1A1A1A] mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                                    {t("dashboard.autoPost.config.geoTargetLabel")}
                                    <span className="text-[#E94E77]">*</span>
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
                                <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t-2 border-gray-100">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading || !isFormComplete}
                                        className="flex-1 min-h-[54px] inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[12px] border-2 border-black bg-[#C6F035] text-black font-black text-sm hover:bg-[#B7E100] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> {t("dashboard.autoPost.actions.saving")}</>
                                        ) : (
                                            <><Check className="w-4 h-4 stroke-[3px]" /> {schedule ? t("dashboard.autoPost.actions.saveUpdate") : t("dashboard.autoPost.actions.saveCreate")}</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleGeneratePreview}
                                        disabled={generatingPreview || !isFormComplete}
                                        className="sm:min-w-[220px] min-h-[54px] inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-[#1A1A1A] border-2 border-black rounded-[12px] font-black text-sm hover:bg-gray-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {generatingPreview ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> {t("dashboard.autoPost.actions.generating")}</>
                                        ) : (
                                            <><Eye className="w-4 h-4 stroke-[3px]" /> {t("dashboard.autoPost.actions.previewWithMetrics")}</>
                                        )}
                                    </button>
                                    {schedule && (
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="sm:min-w-[140px] min-h-[54px] inline-flex items-center justify-center px-5 py-3.5 bg-white text-black border-2 border-black rounded-[12px] font-black text-sm hover:bg-gray-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                                        >
                                            {t("dashboard.autoPost.actions.cancel")}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t-2 border-gray-100">
                                    <button
                                        onClick={handleGeneratePreview}
                                        disabled={generatingPreview || !isFormComplete}
                                        className="flex-1 min-h-[54px] inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-[#1A1A1A] border-2 border-black rounded-[12px] font-black text-sm hover:bg-gray-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {generatingPreview ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> {t("dashboard.autoPost.actions.generating")}</>
                                        ) : (
                                            <><Eye className="w-4 h-4 stroke-[3px]" /> {t("dashboard.autoPost.actions.previewNextPost")}</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="sm:min-w-[170px] min-h-[54px] px-5 py-3.5 bg-red-600 text-white border-2 border-black rounded-[12px] font-black text-sm hover:bg-red-500 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all inline-flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4 stroke-[2.5px]" /> {t("dashboard.autoPost.actions.delete")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio Summary */}
                    {schedule?.bioSummary && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-[20px] border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-black text-[#1A1A1A] flex items-center gap-2 text-base" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Bot className="w-5 h-5 text-black" />
                                    {t("dashboard.autoPost.bioSummary.title")}
                                </h3>
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={generatingSummary}
                                    className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${generatingSummary ? 'animate-spin' : ''}`} />
                                    {t("dashboard.autoPost.bioSummary.refresh")}
                                </button>
                            </div>
                            <p className="text-sm font-medium text-gray-600 bg-gray-50 p-5 rounded-[14px] border-2 border-gray-100 leading-relaxed">
                                {schedule.bioSummary}
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-5"
                >
                    {/* Recent Posts with Metrics */}
                    <div className="bg-white rounded-[20px] border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="p-5 border-b-3 border-black bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                            <h3 className="font-black text-[#1A1A1A] flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                                <BarChart3 className="w-4 h-4 text-black" />
                                {t("dashboard.autoPost.sidebar.recentAutoPosts")}
                            </h3>
                        </div>
                        <div className="divide-y-2 divide-gray-100">
                            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                                stats.recentLogs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                        className="p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 border border-black shrink-0 ${log.status === 'published' ? 'bg-[#C6F035]' :
                                                    log.status === 'failed' ? 'bg-[#E94E77]' : 'bg-yellow-400'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[#1A1A1A] text-xs truncate mb-0.5">
                                                    {log.generatedTitle}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                    {format(new Date(log.createdAt), "MMM d, yyyy", { locale })}
                                                </p>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {log.seoScore && (
                                                        <ScoreBadge score={log.seoScore} label="SEO" />
                                                    )}
                                                    {log.geoScore && (
                                                        <ScoreBadge score={log.geoScore} label="GEO" />
                                                    )}
                                                    <button
                                                        onClick={() => handleViewMetrics(log)}
                                                        className="text-[11px] font-black text-black underline hover:no-underline ml-auto"
                                                    >
                                                        {t("dashboard.autoPost.sidebar.viewDetails")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 font-medium text-sm">
                                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    {t("dashboard.autoPost.sidebar.noAutoPosts")}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-[#1A1A1A] rounded-[20px] border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] p-5 text-white">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-gradient-to-br from-[#d2e823] to-[#C6F035] rounded-lg text-black shrink-0">
                                <Lightbulb className="w-4 h-4 fill-black" />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-sm mb-2.5" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.autoPost.info.title")}</h4>
                                <ul className="text-xs text-gray-300 space-y-2 font-medium">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C6F035] mt-0.5 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet1")}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C6F035] mt-0.5 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet2")}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C6F035] mt-0.5 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet3")}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C6F035] mt-0.5 shrink-0" />
                                        {t("dashboard.autoPost.info.bullet4")}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Preview Modal with Metrics */}
            <AnimatePresence>
            {showPreview && previewData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 lg:p-6"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white w-full max-w-[1320px] h-[96vh] sm:h-[94vh] lg:h-[90vh] overflow-hidden border-3 border-black rounded-[18px] sm:rounded-[24px] lg:rounded-[28px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col"
                    >
                        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b-3 border-black flex items-start sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-white to-gray-50 shrink-0">
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-[#1A1A1A] flex items-center gap-2 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0" />
                                    {t("dashboard.autoPost.preview.title")}
                                </h3>
                                <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
                                    {t("dashboard.autoPost.preview.subtitle")}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 sm:p-2.5 bg-white border-2 border-black rounded-[10px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all shrink-0"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden bg-[#F7F7F6]">
                            <div className="h-full flex flex-col lg:flex-row">
                                {/* Left: Content Preview */}
                                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-7 lg:border-r-3 border-black bg-white min-h-0">
                                    <div className="mb-5 sm:mb-7 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-gray-50 to-white rounded-[18px] sm:rounded-[22px] border-2 border-gray-200 shadow-[0_2px_0_0_rgba(0,0,0,0.06)]">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <ScoreBadge score={previewData.seoMetrics.seoScore} label="SEO" />
                                            <ScoreBadge score={previewData.geoMetrics.geoScore} label="GEO" />
                                            {previewData.aeoMetrics && (
                                                <ScoreBadge score={previewData.aeoMetrics.aeoScore} label="AEO" />
                                            )}
                                        </div>
                                        <h2 className="text-xl sm:text-2xl lg:text-[30px] font-black text-[#1A1A1A] mb-2.5 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                                            {previewData.title}
                                        </h2>
                                        <p className="text-sm sm:text-base font-medium text-gray-600 leading-relaxed">
                                            {previewData.metaDescription}
                                        </p>
                                    </div>
                                    <div className="prose prose-base max-w-none prose-headings:font-black prose-headings:font-display prose-p:font-medium prose-p:text-gray-600 prose-headings:text-[#1A1A1A] prose-p:leading-7">
                                        <MarkdownRenderer content={previewData.content} />
                                    </div>
                                </div>

                                {/* Right: Metrics Dashboard */}
                                <div className="w-full lg:w-[400px] xl:w-[460px] h-[40vh] sm:h-[42vh] lg:h-auto bg-gray-50 overflow-y-auto px-4 sm:px-5 lg:px-6 py-4 sm:py-5 lg:py-6 border-t-3 lg:border-t-0 border-black shrink-0 min-h-0">
                                    <h3 className="text-xs sm:text-sm font-black text-[#1A1A1A] mb-4 sm:mb-5 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-gray-50 py-1 z-10">
                                        <Target className="w-4 h-4" />
                                        {t("dashboard.autoPost.metricsModal.analysisTitle")}
                                    </h3>
                                    <SEOGEODashboard metrics={previewData} variant="full" />
                                </div>
                            </div>
                        </div>

                        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t-3 border-black bg-gradient-to-r from-white to-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                            <p className="text-[11px] sm:text-xs font-bold text-gray-500 hidden lg:block">
                                {t("dashboard.autoPost.preview.subtitle")}
                            </p>

                            <div className="flex w-full sm:w-auto flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="w-full sm:w-auto sm:min-w-[140px] min-h-[48px] inline-flex items-center justify-center px-4 py-2.5 bg-white text-[#1A1A1A] border-2 border-black rounded-[12px] font-black text-sm hover:bg-gray-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                                >
                                    {t("dashboard.autoPost.preview.close")}
                                </button>

                                {!schedule && (
                                    <button
                                        onClick={handleSave}
                                        disabled={loading || !isFormComplete}
                                        className="w-full sm:w-auto sm:min-w-[230px] min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C6F035] text-black border-2 border-black rounded-[12px] font-black text-sm hover:bg-[#B7E100] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> {t("dashboard.autoPost.actions.saving")}</>
                                        ) : (
                                            <><Check className="w-4 h-4 stroke-[3px]" /> {t("dashboard.autoPost.preview.createSchedule")}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Metrics Detail Modal for Historical Posts */}
            <AnimatePresence>
            {showMetricsModal && selectedLog && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[28px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-3 border-black flex flex-col"
                    >
                        <div className="p-5 md:p-6 border-b-3 border-black bg-gradient-to-r from-gray-50 to-white flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.autoPost.metricsModal.title")}</h3>
                                <p className="text-xs font-bold text-gray-500 mt-0.5 truncate max-w-md">{selectedLog.generatedTitle}</p>
                            </div>
                            <button
                                onClick={() => setShowMetricsModal(false)}
                                className="p-2.5 bg-white border-2 border-black rounded-[10px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                            >
                                <X className="w-5 h-5 stroke-[3px]" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                <div className="bg-[#1A1A1A] p-4 rounded-[16px] text-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
                                    <p className="text-3xl font-black text-[#C6F035]">
                                        {selectedLog.seoScore || "--"}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.seoScore")}</p>
                                </div>
                                <div className="bg-[#1A1A1A] p-4 rounded-[16px] text-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
                                    <p className="text-3xl font-black text-[#0047FF]">
                                        {selectedLog.geoScore || "--"}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.geoScore")}</p>
                                </div>
                                <div className="bg-white p-4 rounded-[16px] text-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-3xl font-black text-black">
                                        {selectedLog.readabilityScore || "--"}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1.5 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.readability")}</p>
                                </div>
                                <div className="bg-white p-4 rounded-[16px] text-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-3xl font-black text-black">
                                        {selectedLog.contentAnalysis?.wordCount || "--"}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1.5 uppercase tracking-wider">{t("dashboard.autoPost.metricsModal.words")}</p>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="space-y-4">
                                {selectedLog.keywordAnalysis && (
                                    <div className="bg-white p-5 rounded-[16px] border-2 border-black">
                                        <h4 className="font-black text-[#1A1A1A] mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
                                            <Hash className="w-3.5 h-3.5" />
                                            {t("dashboard.autoPost.metricsModal.keywords")}
                                        </h4>
                                        <p className="text-xs font-bold text-[#1A1A1A] mb-2.5">
                                            {t("dashboard.autoPost.metricsModal.primary")}: <span className="bg-[#C6F035] px-1.5 py-0.5 rounded border border-black">{selectedLog.keywordAnalysis.primaryKeyword}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedLog.keywordAnalysis.secondaryKeywords?.map((kw: string, i: number) => (
                                                <span key={i} className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedLog.improvementSuggestions?.length > 0 && (
                                    <div className="bg-[#fff9db] p-5 rounded-[16px] border-2 border-black">
                                        <h4 className="font-black text-[#1A1A1A] mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
                                            <Lightbulb className="w-3.5 h-3.5 text-black fill-[#C6F035]" />
                                            {t("dashboard.autoPost.metricsModal.seoSuggestions")}
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedLog.improvementSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-xs font-medium text-[#1A1A1A] flex items-start gap-2">
                                                    <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedLog.geoSuggestions?.length > 0 && (
                                    <div className="bg-[#f0f4ff] p-5 rounded-[16px] border-2 border-black">
                                        <h4 className="font-black text-[#1A1A1A] mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
                                            <Brain className="w-3.5 h-3.5 text-[#0047FF]" />
                                            {t("dashboard.autoPost.metricsModal.geoSuggestions")}
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedLog.geoSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-xs font-medium text-[#1A1A1A] flex items-start gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-[#0047FF] shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5 border-t-3 border-black bg-white flex justify-end shrink-0">
                            <button
                                onClick={() => setShowMetricsModal(false)}
                                className="px-6 py-2.5 bg-[#1A1A1A] text-white border-2 border-black rounded-[10px] font-black text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] transition-all"
                            >
                                {t("dashboard.autoPost.metricsModal.close")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}

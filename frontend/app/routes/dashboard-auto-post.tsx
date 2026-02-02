import type { MetaFunction } from "react-router";
import { useState, useEffect, useCallback } from "react";
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

const frequencies: { value: PostFrequency; label: string; description: string }[] = [
    { value: "daily", label: "Daily", description: "New post every day" },
    { value: "weekly", label: "Weekly", description: "New post every week" },
    { value: "biweekly", label: "Bi-weekly", description: "New post every 2 weeks" },
    { value: "monthly", label: "Monthly", description: "New post every month" },
];

const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "technical", label: "Technical" },
    { value: "creative", label: "Creative" },
    { value: "authoritative", label: "Authoritative" },
];

const postLengths = [
    { value: "short", label: "Short", description: "600-800 words" },
    { value: "medium", label: "Medium", description: "1000-1500 words" },
    { value: "long", label: "Long", description: "1800-2500 words" },
];

// Score color helpers
const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-lime-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
};

export default function DashboardAutoPost() {
    const { t, i18n } = useTranslation();
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
        if (!confirm("Are you sure you want to delete this auto-post schedule?")) return;
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

    // Generate metadata when topics change (debounced)
    const handleTopicsChange = (value: string) => {
        setFormData(prev => ({ ...prev, topics: value }));
        
        // Clear existing timer
        if (topicsDebounceTimer) {
            clearTimeout(topicsDebounceTimer);
        }
        
        // Only generate metadata if user has entered enough text and is in editing mode
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
            }, 1500); // Wait 1.5 seconds after user stops typing
            
            setTopicsDebounceTimer(timer);
        }
    };

    // Apply suggested metadata to form
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
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                <div className="card p-8 text-center">
                    <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>Select a Bio First</h2>
                    <p className="text-muted-foreground">Please select a bio from the sidebar to configure auto-post.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3 h-3" />
                        Pro Feature
                    </div>
                    <h1 className="text-4xl font-bold text-text-main tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>Auto Post</h1>
                    <p className="text-lg text-text-muted">
                        AI-powered content with advanced SEO, GEO & AEO optimization
                    </p>
                </div>
                
                {schedule && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggle}
                            className={`btn ${schedule.isActive ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {schedule.isActive ? (
                                <><Pause className="w-4 h-4" /> Pause</>
                            ) : (
                                <><Play className="w-4 h-4" /> Resume</>
                            )}
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="btn btn-secondary"
                        >
                            <Edit3 className="w-4 h-4" />
                            {isEditing ? "Cancel" : "Edit"}
                        </button>
                    </div>
                )}
            </header>

            {/* Enhanced Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Posts This Month */}
                    <div className="card p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Posts This Month</p>
                                <p className="text-2xl font-bold text-text-main">{stats.postsThisMonth}</p>
                            </div>
                        </div>
                        <div className="text-xs text-text-muted">
                            {stats.remainingPosts} remaining of {PLAN_LIMITS.pro.autoPostPerMonth}
                        </div>
                    </div>

                    {/* Next Post */}
                    <div className="card p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Next Post</p>
                                <p className="text-lg font-bold text-text-main">
                                    {stats.nextPostDate 
                                        ? (() => {
                                            const nextDate = new Date(stats.nextPostDate);
                                            const today = new Date();
                                            const isToday = nextDate.toDateString() === today.toDateString();
                                            return isToday ? "Today" : format(nextDate, "MMM d", { locale });
                                        })()
                                        : "Not scheduled"
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-text-muted">
                            {stats.nextPostDate 
                                ? format(new Date(stats.nextPostDate), "h:mm a", { locale })
                                : (schedule?.preferredTime || "--")
                            }
                            {stats.nextPostDate && new Date(stats.nextPostDate) < new Date() && (
                                <span className="text-yellow-400 ml-2">(Overdue)</span>
                            )}
                        </div>
                    </div>

                    {/* Last Post */}
                    <div className="card p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <RotateCcw className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Last Post</p>
                                <p className="text-lg font-bold text-text-main">
                                    {stats.lastPostDate 
                                        ? (() => {
                                            const lastDate = new Date(stats.lastPostDate);
                                            const today = new Date();
                                            const isToday = lastDate.toDateString() === today.toDateString();
                                            return isToday ? "Today" : format(lastDate, "MMM d", { locale });
                                        })()
                                        : "Never"
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-text-muted">
                            {stats.lastPostDate 
                                ? format(new Date(stats.lastPostDate), "h:mm a", { locale })
                                : "No posts yet"
                            }
                        </div>
                    </div>

                    {/* Status */}
                    <div className="card p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                schedule?.isActive ? 'bg-green-500/20' : 'bg-muted'
                            }`}>
                                <Zap className={`w-5 h-5 ${schedule?.isActive ? 'text-green-400' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Status</p>
                                <p className="text-lg font-bold text-text-main">
                                    {schedule?.isActive ? "Active" : "Paused"}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-text-muted capitalize">
                            {schedule?.frequency || "Not configured"}
                        </div>
                    </div>

                    {/* Average Scores */}
                    <div className="card p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <Award className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm text-text-muted">Avg Scores</p>
                        </div>
                        
                        {/* Scores Grid */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {/* SEO */}
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                <p className="text-xs text-text-muted mb-1">SEO</p>
                                <p className={`text-lg font-bold ${getScoreColor(stats.averageScores.avgSeoScore)}`}>
                                    {stats.averageScores.avgSeoScore || "--"}
                                </p>
                            </div>
                            {/* GEO */}
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                <p className="text-xs text-text-muted mb-1">GEO</p>
                                <p className={`text-lg font-bold ${getScoreColor(stats.averageScores.avgGeoScore)}`}>
                                    {stats.averageScores.avgGeoScore || "--"}
                                </p>
                            </div>
                            {/* AEO */}
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                <p className="text-xs text-text-muted mb-1">AEO</p>
                                <p className={`text-lg font-bold ${getScoreColor(stats.averageScores.avgAeoScore)}`}>
                                    {stats.averageScores.avgAeoScore || "--"}
                                </p>
                            </div>
                            {/* AIO */}
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                <p className="text-xs text-text-muted mb-1">AIO</p>
                                <p className={`text-lg font-bold ${getScoreColor(stats.averageScores.avgAioScore)}`}>
                                    {stats.averageScores.avgAioScore || "--"}
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-xs text-text-muted text-center">
                            Based on {stats.recentLogs.length} post{stats.recentLogs.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-lg font-bold text-text-main flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                                <Target className="w-5 h-5 text-primary" />
                                Configuration
                            </h2>
                            <p className="text-sm text-text-muted mt-1">
                                Customize how AI generates your blog posts
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Frequency, Time & Start Date */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-3">
                                        Post Frequency
                                    </label>
                                    <div className="space-y-2">
                                        {frequencies.map((freq) => (
                                            <button
                                                key={freq.value}
                                                disabled={!isEditing && !!schedule}
                                                onClick={() => setFormData({ ...formData, frequency: freq.value })}
                                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                                    formData.frequency === freq.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/30'
                                                } ${(!isEditing && !!schedule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-medium text-text-main">{freq.label}</div>
                                                <div className="text-xs text-text-muted">{freq.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-3">
                                        Posting Time
                                    </label>
                                    <div className="relative mb-4">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                        <input
                                            type="time"
                                            value={formData.preferredTime}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:bg-muted text-foreground"
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mb-4">
                                        Posts will be published at this time
                                    </p>

                                    <label className="block text-sm font-medium text-text-main mb-3">
                                        Start Date (Optional)
                                    </label>
                                    <div className="relative">
                                        <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            disabled={!isEditing && !!schedule}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:bg-muted text-foreground"
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mt-2">
                                        Cron starts from this date (leave empty for today)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-3">
                                        Post Length
                                    </label>
                                    <div className="space-y-2">
                                        {postLengths.map((length) => (
                                            <button
                                                key={length.value}
                                                disabled={!isEditing && !!schedule}
                                                onClick={() => setFormData({ ...formData, postLength: length.value })}
                                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                                    formData.postLength === length.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/30'
                                                } ${(!isEditing && !!schedule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-medium text-text-main">{length.label}</div>
                                                <div className="text-xs text-text-muted">{length.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Topics */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Topics & Themes
                                    {generatingMetadata && (
                                        <span className="ml-2 text-xs text-primary inline-flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            AI is analyzing...
                                        </span>
                                    )}
                                </label>
                                <textarea
                                    value={formData.topics}
                                    disabled={!isEditing && !!schedule}
                                    onChange={(e) => handleTopicsChange(e.target.value)}
                                    placeholder="Describe the topics you want to write about (e.g., 'Web development, React tutorials, Career advice'). AI will generate keywords and target audience automatically."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none h-24 disabled:bg-muted text-foreground placeholder:text-muted-foreground"
                                />
                                
                                {/* Metadata Suggestions Modal */}
                                {showMetadataSuggestions && metadataSuggestions && (
                                    <div className="absolute z-10 mt-2 w-full bg-surface-card border border-border rounded-xl shadow-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-text-main flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                AI Suggestions
                                            </h4>
                                            <button 
                                                onClick={() => setShowMetadataSuggestions(false)}
                                                className="text-muted-foreground hover:text-text-main"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {metadataSuggestions.keywords?.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs text-text-muted mb-1">Suggested Keywords:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {metadataSuggestions.keywords.slice(0, 8).map((kw: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {metadataSuggestions.targetAudience && (
                                            <div className="mb-3">
                                                <p className="text-xs text-text-muted mb-1">Target Audience:</p>
                                                <p className="text-xs text-text-main line-clamp-2">{metadataSuggestions.targetAudience}</p>
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => applyMetadata(metadataSuggestions)}
                                                className="btn btn-primary btn-sm flex-1"
                                            >
                                                <Check className="w-3 h-3" />
                                                Apply Suggestions
                                            </button>
                                            <button
                                                onClick={() => setShowMetadataSuggestions(false)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                Ignore
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2 flex items-center justify-between">
                                    <span>SEO Keywords</span>
                                    {metadataSuggestions?.keywords && formData.keywords === metadataSuggestions.keywords.join(", ") && (
                                        <span className="text-xs text-primary flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            AI Generated
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={formData.keywords}
                                    disabled={!isEditing && !!schedule}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                    placeholder="Enter keywords separated by commas (or let AI generate them from your topics)"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:bg-muted text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tone */}
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2">
                                        Writing Tone
                                    </label>
                                    <select
                                        value={formData.tone}
                                        disabled={!isEditing && !!schedule}
                                        onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:bg-muted text-foreground"
                                    >
                                        {tones.map((tone) => (
                                            <option key={tone.value} value={tone.value}>
                                                {tone.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2 flex items-center justify-between">
                                        <span>Target Audience</span>
                                        {metadataSuggestions?.targetAudience && formData.targetAudience === metadataSuggestions.targetAudience && (
                                            <span className="text-xs text-primary flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                AI Generated
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.targetAudience}
                                        disabled={!isEditing && !!schedule}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        placeholder="Who are you writing for? (AI will suggest based on your topics)"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:bg-muted text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>

                            {/* Target Country & Language */}
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Geographic Target & Language
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
                                <div className="flex items-center gap-2 mt-2">
                                    <p className="text-xs text-text-muted">
                                        {formData.targetCountry ? (
                                            <>
                                                Target: <span className="text-primary font-medium">
                                                    {COUNTRIES.find(c => c.code === formData.targetCountry)?.name}
                                                </span>
                                                {' '}&bull; Language: <span className="text-primary font-medium">
                                                    {COUNTRIES.find(c => c.code === formData.targetCountry)?.language}
                                                </span>
                                            </>
                                        ) : (
                                            "Select a country to optimize content for local SEO, cultural references, and regional preferences"
                                        )}
                                    </p>
                                    {(!isEditing && !!schedule) && (
                                        <span className="text-xs text-yellow-500">(Edit to change)</span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing || !schedule ? (
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="btn btn-primary flex-1"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Check className="w-4 h-4" /> {schedule ? "Update Schedule" : "Create Schedule"}</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleGeneratePreview}
                                        disabled={generatingPreview}
                                        className="btn btn-secondary"
                                    >
                                        {generatingPreview ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Eye className="w-4 h-4" /> Preview with Metrics</>
                                        )}
                                    </button>
                                    {schedule && (
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="btn btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleGeneratePreview}
                                        disabled={generatingPreview}
                                        className="btn btn-secondary"
                                    >
                                        {generatingPreview ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Eye className="w-4 h-4" /> Preview Next Post</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-danger"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio Summary */}
                    {schedule?.bioSummary && (
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-text-main flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-primary" />
                                    AI Understanding of Your Bio
                                </h3>
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={generatingSummary}
                                    className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                                >
                                    <RefreshCw className={`w-4 h-4 ${generatingSummary ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                            <p className="text-sm text-text-muted bg-muted p-4 rounded-xl">
                                {schedule.bioSummary}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Posts with Metrics */}
                    <div className="card">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-text-main flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Recent Auto Posts
                            </h3>
                        </div>
                        <div className="divide-y divide-border">
                            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                                stats.recentLogs.map((log) => (
                                    <div key={log.id} className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                                log.status === 'published' ? 'bg-green-500' : 
                                                log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-text-main text-sm truncate">
                                                    {log.generatedTitle}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    {format(new Date(log.createdAt), "MMM d, yyyy", { locale })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {log.seoScore && (
                                                        <ScoreBadge score={log.seoScore} label="SEO" />
                                                    )}
                                                    {log.geoScore && (
                                                        <ScoreBadge score={log.geoScore} label="GEO" />
                                                    )}
                                                    {log.aeoScore && (
                                                        <ScoreBadge score={log.aeoScore} label="AEO" />
                                                    )}
                                                    {log.aioScore && (
                                                        <ScoreBadge score={log.aioScore} label="AIO" />
                                                    )}
                                                    <button
                                                        onClick={() => handleViewMetrics(log)}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-text-muted text-sm">
                                    No auto posts yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-text-main text-sm mb-2">How it works</h4>
                                <ul className="text-xs text-text-muted space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5" />
                                        AI analyzes your bio for deep understanding
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5" />
                                        Generates SEO + GEO + AEO + AIO optimized content
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5" />
                                        Detailed metrics for every post
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5" />
                                        Publishes automatically on schedule
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal with Metrics */}
            {showPreview && previewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
                    <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-hidden border border-border">
                        <div className="p-3 md:p-6 border-b border-border flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="text-base md:text-lg font-bold text-text-main truncate" style={{ fontFamily: 'var(--font-display)' }}>Post Preview</h3>
                                <p className="text-xs md:text-sm text-text-muted hidden sm:block">Complete optimization metrics for this generated post</p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
                                {/* Left: Content Preview */}
                                <div className="p-4 md:p-6 xl:border-r border-border">
                                    <div className="mb-4">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <ScoreBadge score={previewData.seoMetrics.seoScore} label="SEO" />
                                            <ScoreBadge score={previewData.geoMetrics.geoScore} label="GEO" />
                                            {previewData.aeoMetrics && (
                                                <ScoreBadge score={previewData.aeoMetrics.aeoScore} label="AEO" />
                                            )}
                                            {previewData.aioMetrics && (
                                                <ScoreBadge score={previewData.aioMetrics.aioScore} label="AIO" />
                                            )}
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-text-main mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                            {previewData.title}
                                        </h2>
                                        <p className="text-sm text-text-muted mb-4">
                                            {previewData.metaDescription}
                                        </p>
                                    </div>
                                    <div className="max-w-none">
                                        <MarkdownRenderer content={previewData.content} />
                                    </div>
                                </div>

                                {/* Right: Metrics Dashboard */}
                                <div className="p-4 md:p-6 bg-muted/30 border-t xl:border-t-0 border-border">
                                    <SEOGEODashboard metrics={previewData} variant="full" />
                                </div>
                            </div>
                        </div>

                        <div className="p-3 md:p-6 border-t border-border bg-muted flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="btn btn-secondary w-full sm:w-auto"
                            >
                                Close
                            </button>
                            {!schedule && (
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary w-full sm:w-auto"
                                >
                                    <Check className="w-4 h-4" />
                                    Create Schedule
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Detail Modal for Historical Posts */}
            {showMetricsModal && selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-border">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-text-main">Post Metrics</h3>
                                <p className="text-sm text-text-muted">{selectedLog.generatedTitle}</p>
                            </div>
                            <button
                                onClick={() => setShowMetricsModal(false)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                                <div className="card p-4 text-center">
                                    <p className={`text-3xl font-bold ${getScoreColor(selectedLog.seoScore || 0)}`}>
                                        {selectedLog.seoScore || "--"}
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">SEO Score</p>
                                </div>
                                <div className="card p-4 text-center">
                                    <p className={`text-3xl font-bold ${getScoreColor(selectedLog.geoScore || 0)}`}>
                                        {selectedLog.geoScore || "--"}
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">GEO Score</p>
                                </div>
                                <div className="card p-4 text-center">
                                    <p className={`text-3xl font-bold ${getScoreColor(selectedLog.aeoScore || 0)}`}>
                                        {selectedLog.aeoScore || "--"}
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">AEO Score</p>
                                </div>
                                <div className="card p-4 text-center">
                                    <p className={`text-3xl font-bold ${getScoreColor(selectedLog.aioScore || 0)}`}>
                                        {selectedLog.aioScore || "--"}
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">AIO Score</p>
                                </div>
                                <div className="card p-4 text-center">
                                    <p className={`text-3xl font-bold ${getScoreColor(selectedLog.readabilityScore || 0)}`}>
                                        {selectedLog.readabilityScore || "--"}
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">Readability</p>
                                </div>
                                <div className="card p-4 text-center">
                                    <p className="text-3xl font-bold text-text-main">
                                        {selectedLog.titleLength || "--"}
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">Title Chars</p>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="space-y-4">
                                {selectedLog.keywordAnalysis && (
                                    <div className="card p-4">
                                        <h4 className="font-medium text-text-main mb-3 flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-primary" />
                                            Keywords
                                        </h4>
                                        <p className="text-sm text-text-muted">
                                            Primary: <span className="text-primary font-medium">{selectedLog.keywordAnalysis.primaryKeyword}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedLog.keywordAnalysis.secondaryKeywords?.map((kw: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-muted rounded text-xs text-text-main">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedLog.contentAnalysis && (
                                    <div className="card p-4">
                                        <h4 className="font-medium text-text-main mb-3">Content Structure</h4>
                                        <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                            <div className="p-2 bg-muted rounded">
                                                <p className="font-bold text-text-main">{selectedLog.contentAnalysis.headingsCount}</p>
                                                <p className="text-xs text-text-muted">Headings</p>
                                            </div>
                                            <div className="p-2 bg-muted rounded">
                                                <p className="font-bold text-text-main">{selectedLog.contentAnalysis.paragraphCount}</p>
                                                <p className="text-xs text-text-muted">Paragraphs</p>
                                            </div>
                                            <div className="p-2 bg-muted rounded">
                                                <p className="font-bold text-text-main">{selectedLog.contentAnalysis.listCount}</p>
                                                <p className="text-xs text-text-muted">Lists</p>
                                            </div>
                                            <div className="p-2 bg-muted rounded">
                                                <p className="font-bold text-text-main">{selectedLog.contentAnalysis.wordCount || "--"}</p>
                                                <p className="text-xs text-text-muted">Words</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.improvementSuggestions?.length > 0 && (
                                    <div className="card p-4">
                                        <h4 className="font-medium text-text-main mb-3 flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                                            SEO Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedLog.improvementSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedLog.geoSuggestions?.length > 0 && (
                                    <div className="card p-4">
                                        <h4 className="font-medium text-text-main mb-3 flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-purple-400" />
                                            GEO Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedLog.geoSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                                                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedLog.aeoSuggestions?.length > 0 && (
                                    <div className="card p-4">
                                        <h4 className="font-medium text-text-main mb-3 flex items-center gap-2">
                                            <Mic className="w-4 h-4 text-cyan-400" />
                                            AEO Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedLog.aeoSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                                                    <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedLog.aioSuggestions?.length > 0 && (
                                    <div className="card p-4">
                                        <h4 className="font-medium text-text-main mb-3 flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-orange-400" />
                                            AIO Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedLog.aioSuggestions.map((s: string, i: number) => (
                                                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                                                    <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-muted flex justify-end">
                            <button
                                onClick={() => setShowMetricsModal(false)}
                                className="btn btn-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

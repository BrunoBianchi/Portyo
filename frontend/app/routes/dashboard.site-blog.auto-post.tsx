import { useState, useEffect } from "react";
import { useSiteAutoPost } from "~/contexts/site-auto-post.context";
import type { SitePostFrequency } from "~/contexts/site-auto-post.context";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
    Bot,
    Calendar,
    Clock,
    Sparkles,
    Play,
    Pause,
    Settings,
    Eye,
    Trash2,
    Save,
    TrendingUp,
    FileText,
    Languages,
    Target,
    Zap,
    RefreshCw,
    BarChart3,
    Hash,
    AlignLeft,
    Lightbulb,
    BookOpen,
    LayoutTemplate,
    Palette,
    Tag,
    History,
} from "lucide-react";

// Writing style options with icons and descriptions
const writingStyles = [
    { id: "professional", label: "Professional", icon: "👔", desc: "Corporate and formal tone" },
    { id: "casual", label: "Casual", icon: "😊", desc: "Conversational and relaxed" },
    { id: "friendly", label: "Friendly", icon: "🤝", desc: "Warm and approachable" },
    { id: "authoritative", label: "Authoritative", icon: "📊", desc: "Expert and trustworthy" },
    { id: "creative", label: "Creative", icon: "🎨", desc: "Innovative and imaginative" },
    { id: "storytelling", label: "Storytelling", icon: "📖", desc: "Engaging narratives" },
    { id: "persuasive", label: "Persuasive", icon: "🎯", desc: "Convince and convert" },
    { id: "educational", label: "Educational", icon: "🎓", desc: "Teach step-by-step" },
];

// Post structure options
const postStructures = [
    { id: "standard", label: "Standard", desc: "Intro, body, conclusion" },
    { id: "listicle", label: "Listicle", desc: "Numbered list format", icon: Hash },
    { id: "howto", label: "How-to", desc: "Step-by-step guide", icon: Zap },
    { id: "story", label: "Storytelling", desc: "Engaging narrative", icon: BookOpen },
    { id: "case-study", label: "Case Study", desc: "Detailed analysis", icon: BarChart3 },
];

// Content categories
const contentCategories = [
    { id: "technology", label: "Technology", color: "bg-blue-100", icon: Zap },
    { id: "marketing", label: "Marketing", color: "bg-pink-100", icon: Target },
    { id: "business", label: "Business", color: "bg-purple-100", icon: TrendingUp },
    { id: "lifestyle", label: "Lifestyle", color: "bg-green-100", icon: Sparkles },
    { id: "education", label: "Education", color: "bg-yellow-100", icon: BookOpen },
    { id: "health", label: "Health", color: "bg-red-100", icon: Sparkles }, // Replaced Heart
    { id: "finance", label: "Finance", color: "bg-emerald-100", icon: BarChart3 },
    { id: "entertainment", label: "Entertainment", color: "bg-orange-100", icon: Sparkles },
];

// Frequency options with descriptions
const frequencyOptions: { value: SitePostFrequency; label: string; desc: string; icon: any }[] = [
    { value: "5hours", label: "Every 5 hours", desc: "Constant content", icon: Zap },
    { value: "daily", label: "Daily", desc: "One post per day", icon: Calendar },
    { value: "weekly", label: "Weekly", desc: "Post every week", icon: Calendar },
    { value: "biweekly", label: "Biweekly", desc: "Every 2 weeks", icon: Calendar },
    { value: "monthly", label: "Monthly", desc: "Post once a month", icon: Calendar },
];

// Post length options
const postLengthOptions = [
    { value: "short", label: "Short", desc: "~800 words", time: "3-5 min read", icon: AlignLeft },
    { value: "medium", label: "Medium", desc: "~1500 words", time: "6-8 min read", icon: FileText },
    { value: "long", label: "Long", desc: "~2500 words", time: "10-15 min read", icon: BookOpen },
];

export default function DashboardSiteAutoPost() {
    const { t, i18n } = useTranslation("dashboard");
    const {
        schedule,
        stats,
        logs,
        loading,
        generatingPreview,
        saving,
        createSchedule,
        updateSchedule,
        toggleSchedule,
        deleteSchedule,
        generatePreview,
    } = useSiteAutoPost();

    const [isEditing, setIsEditing] = useState(!schedule);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");

    // Enhanced form state
    const [formData, setFormData] = useState({
        frequency: "daily" as SitePostFrequency,
        topics: "",
        keywords: "" as string,
        targetAudience: "",
        tone: "professional",
        postLength: "medium",
        language: "pt",
        preferredTime: "09:00",
        bilingual: true,
        isActive: true,
        categories: [] as string[],
    });

    // Load schedule data into form
    useEffect(() => {
        if (schedule) {
            setFormData({
                frequency: schedule.frequency,
                topics: schedule.topics || "",
                keywords: schedule.keywords?.join(", ") || "",
                targetAudience: schedule.targetAudience || "",
                tone: schedule.tone,
                postLength: schedule.postLength,
                language: schedule.language,
                preferredTime: schedule.preferredTime,
                bilingual: schedule.bilingual,
                isActive: schedule.isActive,
                categories: schedule.categories || [],
            });
        }
    }, [schedule]);

    const handleSave = async () => {
        try {
            const config = {
                ...formData,
                keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean),
            };

            if (schedule) {
                await updateSchedule(config);
                toast.success(t("dashboard.siteAutoPost.toast.updateSuccess"));
            } else {
                await createSchedule(config);
                toast.success(t("dashboard.siteAutoPost.toast.createSuccess"));
            }
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("dashboard.siteAutoPost.toast.saveError"));
        }
    };

    const handleToggle = async () => {
        try {
            await toggleSchedule(!schedule?.isActive);
            toast.success(
                schedule?.isActive
                    ? t("dashboard.siteAutoPost.toast.pausedSuccess")
                    : t("dashboard.siteAutoPost.toast.activatedSuccess")
            );
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("dashboard.siteAutoPost.toast.statusError"));
        }
    };

    const handleDelete = async () => {
        if (!confirm(t("dashboard.siteAutoPost.confirmDelete"))) return;
        try {
            await deleteSchedule();
            toast.success(t("dashboard.siteAutoPost.toast.deleteSuccess"));
            setIsEditing(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("dashboard.siteAutoPost.toast.deleteError"));
        }
    };

    const handleGeneratePreview = async () => {
        try {
            const config = {
                ...formData,
                keywords: formData.keywords.split(",").map(k => k.trim()).filter(Boolean),
            };
            const preview = await generatePreview(config);
            setPreviewData(preview);
            setShowPreview(true);
            toast.success(t("dashboard.siteAutoPost.toast.previewSuccess"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("dashboard.siteAutoPost.toast.previewError"));
        }
    };

    const getFrequencyLabel = (freq: string) => {
        return frequencyOptions.find(f => f.value === freq)?.label || freq;
    };

    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-['Manrope']">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#C6F035] flex items-center justify-center text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Bot className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.siteAutoPost.header.title")}</h1>
                        <p className="text-gray-500 font-medium text-lg">{t("dashboard.siteAutoPost.header.subtitle")}</p>
                    </div>
                </div>

                {schedule && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-gray-200 font-bold text-gray-600 hover:border-black hover:text-black hover:bg-white transition-all bg-white"
                        >
                            <Settings className="w-4 h-4" />
                            {isEditing ? "Cancel Edit" : "Edit Config"}
                        </button>
                        <button
                            onClick={handleToggle}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all ${schedule.isActive
                                    ? "bg-amber-300 text-black hover:bg-amber-400"
                                    : "bg-[#C6F035] text-black hover:bg-[#d4ff3b]"
                                }`}
                        >
                            {saving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : schedule.isActive ? (
                                <Pause className="w-4 h-4" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            {saving
                                ? t("dashboard.siteAutoPost.header.processing")
                                : schedule.isActive
                                    ? t("dashboard.siteAutoPost.header.pause")
                                    : t("dashboard.siteAutoPost.header.activate")}
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Dashboard */}
            {stats?.schedule && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center font-bold ${stats.schedule.isActive ? "bg-[#C6F035]" : "bg-gray-100"}`}>
                                {stats.schedule.isActive ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5 text-gray-500" />}
                            </div>
                            <span className="text-sm text-gray-500 font-black uppercase tracking-wider">{t("dashboard.siteAutoPost.status.status")}</span>
                        </div>
                        <p className="text-2xl font-black text-black">
                            {stats.schedule.isActive ? t("dashboard.siteAutoPost.status.active") : t("dashboard.siteAutoPost.status.paused")}
                        </p>
                        <p className="text-gray-400 font-bold text-sm mt-1">{getFrequencyLabel(stats.schedule.frequency)}</p>
                    </div>

                    {/* Posts This Month */}
                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-black flex items-center justify-center">
                                <FileText className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-sm text-gray-500 font-black uppercase tracking-wider">{t("dashboard.siteAutoPost.status.postsThisMonth")}</span>
                        </div>
                        <p className="text-3xl font-black text-black">{stats.postsThisMonth}</p>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2 border border-blue-200">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min((stats.postsThisMonth / (stats.postsThisMonth + stats.remainingPosts)) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mt-1">{stats.remainingPosts} remaining</p>
                    </div>

                    {/* Next Post */}
                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 border-2 border-black flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-sm text-gray-500 font-black uppercase tracking-wider">{t("dashboard.siteAutoPost.status.nextPost")}</span>
                        </div>
                        <p className="text-xl font-black text-black">
                            {stats.nextPostDate
                                ? new Date(stats.nextPostDate).toLocaleDateString(locale, { day: "numeric", month: "short" })
                                : "—"}
                        </p>
                        <p className="text-gray-400 font-bold text-sm mt-1">
                            {stats.nextPostDate
                                ? new Date(stats.nextPostDate).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                                : t("dashboard.siteAutoPost.status.notScheduled")}
                        </p>
                    </div>

                    {/* Average Score */}
                    <div className="bg-white rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-100 border-2 border-black flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-sm text-gray-500 font-black uppercase tracking-wider">SEO Score</span>
                        </div>
                        <p className="text-3xl font-black text-black">{stats.averageScores?.avgSeoScore || "—"}<span className="text-sm text-gray-400 font-bold">/100</span></p>
                        <p className="text-gray-400 font-bold text-xs mt-1">Based on {logs.length} posts</p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {(isEditing || !schedule) ? (
                        <div className="bg-white rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            {/* Tabs */}
                            <div className="flex items-center gap-2 p-3 border-b-2 border-black bg-gray-50">
                                <button
                                    onClick={() => setActiveTab("basic")}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all border-2 ${activeTab === "basic"
                                            ? "bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            : "border-transparent text-gray-500 hover:text-black hover:bg-white"
                                        }`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Basic
                                </button>
                                <button
                                    onClick={() => setActiveTab("advanced")}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all border-2 ${activeTab === "advanced"
                                            ? "bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            : "border-transparent text-gray-500 hover:text-black hover:bg-white"
                                        }`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Advanced
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    onClick={handleGeneratePreview}
                                    disabled={generatingPreview || !formData.topics}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
                                >
                                    {generatingPreview ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                                    Preview
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-8 space-y-8">
                                {activeTab === "basic" && (
                                    <>
                                        {/* Frequency & Time Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                    <Clock className="w-4 h-4" />
                                                    Post Frequency
                                                </label>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {frequencyOptions.map((freq) => (
                                                        <button
                                                            key={freq.value}
                                                            onClick={() => setFormData({ ...formData, frequency: freq.value })}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${formData.frequency === freq.value
                                                                    ? "border-black bg-[#C6F035] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                                                                    : "border-gray-200 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 border-black ${formData.frequency === freq.value ? "bg-white" : "bg-gray-50"
                                                                }`}>
                                                                <freq.icon className="w-5 h-5 text-black" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-black text-sm">{freq.label}</p>
                                                                <p className="text-xs text-gray-600 font-medium">{freq.desc}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Preferred Time */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                        <Clock className="w-4 h-4" />
                                                        Preferred Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.preferredTime}
                                                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all font-bold text-black"
                                                    />
                                                </div>

                                                {/* Post Length */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                        <Type className="w-4 h-4" />
                                                        Post Length
                                                    </label>
                                                    <div className="space-y-3">
                                                        {postLengthOptions.map((len) => (
                                                            <button
                                                                key={len.value}
                                                                onClick={() => setFormData({ ...formData, postLength: len.value })}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${formData.postLength === len.value
                                                                        ? "border-black bg-[#C6F035] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                                                        : "border-gray-200 bg-white hover:border-black"
                                                                    }`}
                                                            >
                                                                <len.icon className="w-4 h-4 text-black" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-bold text-black">{len.label}</p>
                                                                    <p className="text-xs text-gray-600 font-medium">{len.desc} • {len.time}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Topics */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                                Topics / Themes <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.topics}
                                                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                                                placeholder="Ex: Digital Marketing, SEO, Social Media, Entrepreneurship..."
                                                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all min-h-[120px] resize-none font-medium"
                                            />
                                            <p className="text-xs text-gray-500 font-bold mt-2">
                                                Separate topics with commas. AI will use this to generate relevant content.
                                            </p>
                                        </div>

                                        {/* Keywords & Target Audience */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                    <Hash className="w-4 h-4" />
                                                    Keywords
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.keywords}
                                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                                    placeholder="marketing, seo, strategy..."
                                                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                    <Target className="w-4 h-4" />
                                                    Target Audience
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.targetAudience}
                                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                                    placeholder="Digital entrepreneurs, professionals..."
                                                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === "advanced" && (
                                    <>
                                        {/* Writing Style */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                <Palette className="w-4 h-4" />
                                                Tone & Style
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {writingStyles.map((style) => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => setFormData({ ...formData, tone: style.id })}
                                                        className={`p-3 rounded-xl border-2 transition-all text-left ${formData.tone === style.id
                                                                ? "border-black bg-purple-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                                                : "border-gray-200 bg-white hover:border-black text-gray-400 hover:text-black"
                                                            }`}
                                                    >
                                                        <span className="text-2xl mb-2 block grayscale group-hover:grayscale-0">{style.icon}</span>
                                                        <p className="text-sm font-bold text-black mb-1">
                                                            {style.label}
                                                        </p>
                                                        <p className="text-xs font-medium opacity-60">{style.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Structure & Category */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                    <LayoutTemplate className="w-4 h-4" />
                                                    Post Structure
                                                </label>
                                                <div className="space-y-3">
                                                    {postStructures.map((struct) => (
                                                        <button
                                                            key={struct.id}
                                                            onClick={() => {
                                                                const newCategories = formData.categories?.includes(struct.id)
                                                                    ? formData.categories.filter(c => c !== struct.id)
                                                                    : [...(formData.categories || []), struct.id];
                                                                setFormData({ ...formData, categories: newCategories });
                                                            }}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${formData.categories?.includes(struct.id)
                                                                    ? "border-black bg-orange-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                                                    : "border-gray-200 bg-white hover:border-black"
                                                                }`}
                                                        >
                                                            {struct.icon && <struct.icon className="w-4 h-4 text-black" />}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-black">
                                                                    {struct.label}
                                                                </p>
                                                                <p className="text-xs text-gray-500 font-medium">{struct.desc}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider mb-3">
                                                    <Tag className="w-4 h-4" />
                                                    Primary Category
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {contentCategories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => {
                                                                const newCategories = formData.categories?.includes(cat.id)
                                                                    ? formData.categories.filter(c => c !== cat.id)
                                                                    : [...(formData.categories || []), cat.id];
                                                                setFormData({ ...formData, categories: newCategories });
                                                            }}
                                                            className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${formData.categories?.includes(cat.id)
                                                                    ? "border-black bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                                    : "border-gray-200 bg-white hover:border-black"
                                                                }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded ${cat.color} flex items-center justify-center border-2 border-black`}>
                                                                <cat.icon className="w-3 h-3 text-black" />
                                                            </div>
                                                            <span className="text-sm font-bold text-black">
                                                                {cat.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="space-y-4">
                                            <div className="rounded-xl border-2 border-gray-200 bg-white p-4 flex items-center gap-4 hover:border-black transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.bilingual}
                                                    onChange={(e) => setFormData({ ...formData, bilingual: e.target.checked })}
                                                    className="w-6 h-6 rounded border-2 border-black text-black focus:ring-0 cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Languages className="w-4 h-4 text-black" />
                                                        <span className="font-bold text-black">Bilingual Content</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">Automatically generate posts in both Portuguese and English</p>
                                                </div>
                                            </div>

                                            <div className="rounded-xl border-2 border-black bg-gray-50 p-4 flex items-center gap-4 opacity-75">
                                                <div className="w-6 h-6 rounded border-2 border-black bg-[#C6F035] flex items-center justify-center">
                                                    <Hash className="w-3 h-3 text-black" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-black block mb-1">Automatic Tags</span>
                                                    <p className="text-xs text-gray-500 font-medium">Generates relevant tags for each post automatically</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center justify-between gap-4 p-6 border-t-2 border-black bg-gray-50">
                                {schedule && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-red-200 text-red-600 font-bold hover:border-black hover:bg-red-50 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                                <div className="flex-1"></div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !formData.topics}
                                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#C6F035] text-black font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400"
                                >
                                    {saving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {saving ? "Saving..." : schedule ? "Save Changes" : "Create Automation"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View Mode when not editing */
                        <div className="bg-white rounded-2xl border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Current Configuration</h3>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-gray-200 font-bold text-gray-600 hover:border-black hover:text-black hover:bg-white transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {/* Configuration summaries (readonly) */}
                                <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Frequency</p>
                                    <p className="font-bold text-black">{getFrequencyLabel(schedule.frequency)}</p>
                                </div>
                                <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Time</p>
                                    <p className="font-bold text-black">{schedule.preferredTime}</p>
                                </div>
                                <div className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tone</p>
                                    <p className="font-bold text-black capitalize">{schedule.tone}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar / Logs */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-black uppercase tracking-wide">Recent Logs</h3>
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center">
                                <History className="w-4 h-4 text-black" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {logs.slice(0, 5).map(log => (
                                <div key={log.id} className="p-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded border border-black ${log.status === 'success' ? 'bg-[#C6F035] text-black' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {log.status}
                                        </span>
                                        <span className="text-xs text-gray-400 font-bold">{new Date(log.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-gray-600 font-medium leading-relaxed">{log.message}</p>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <p className="text-center text-gray-400 py-4 font-bold text-sm">No activity logs yet</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#1A1A1A] rounded-2xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-6 h-6 text-[#C6F035]" />
                            <h3 className="text-lg font-black uppercase tracking-wide text-[#C6F035]">Tips</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C6F035] flex-shrink-0 mt-1.5" />
                                Use specific topics for better results
                            </li>
                            <li className="flex gap-3 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C6F035] flex-shrink-0 mt-1.5" />
                                Define a clear target audience
                            </li>
                            <li className="flex gap-3 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C6F035] flex-shrink-0 mt-1.5" />
                                Experiment with different tones
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="hidden">
                {/* Loader for component use */}
                <Loader2 />
                {/* Icons to keep them imported */}
                <Bot /> <Calendar /> <Clock /> <Play /> <Pause />
            </div>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    )
}
function Edit2({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
    )
}
function Type({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>
    )
}

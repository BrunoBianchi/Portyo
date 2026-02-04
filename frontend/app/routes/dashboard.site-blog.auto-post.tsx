import { useState, useEffect } from "react";
import { useSiteAutoPost } from "~/contexts/site-auto-post.context";
import type { SitePostFrequency } from "~/contexts/site-auto-post.context";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { ScoreBadge, SEOGEODashboard } from "~/components/dashboard/seo-geo-metrics";
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
    X,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    FileText,
    Languages,
    Target,
    Zap,
    RefreshCw,
    BarChart3,
    ChevronRight,
    Hash,
    Globe,
    Type,
    AlignLeft,
    Lightbulb,
    BookOpen,
    History,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    LayoutTemplate,
    Palette,
    Users,
    Tag,
    MessageSquare,
    Brain,
} from "lucide-react";
import "~/styles/site-auto-post-theme.css";

// Writing style options with icons and descriptions
const writingStyles = [
    { id: "professional", label: "Profissional", icon: "👔", desc: "Tom corporativo e formal", color: "from-blue-500/20 to-blue-600/10" },
    { id: "casual", label: "Casual", icon: "😊", desc: "Conversacional e relaxado", color: "from-green-500/20 to-green-600/10" },
    { id: "friendly", label: "Amigável", icon: "🤝", desc: "Acolhedor e próximo", color: "from-yellow-500/20 to-yellow-600/10" },
    { id: "authoritative", label: "Autoritativo", icon: "📊", desc: "Especialista e confiável", color: "from-purple-500/20 to-purple-600/10" },
    { id: "creative", label: "Criativo", icon: "🎨", desc: "Inovador e imaginativo", color: "from-pink-500/20 to-pink-600/10" },
    { id: "storytelling", label: "Narrativo", icon: "📖", desc: "Conta histórias envolventes", color: "from-orange-500/20 to-orange-600/10" },
    { id: "persuasive", label: "Persuasivo", icon: "🎯", desc: "Convence e converte", color: "from-red-500/20 to-red-600/10" },
    { id: "educational", label: "Educativo", icon: "🎓", desc: "Ensina passo a passo", color: "from-cyan-500/20 to-cyan-600/10" },
];

// Post structure options
const postStructures = [
    { id: "standard", label: "Padrão", desc: "Introdução, desenvolvimento, conclusão" },
    { id: "listicle", label: "Lista", desc: "Formato de lista numerada", icon: Hash },
    { id: "howto", label: "How-to", desc: "Guia passo a passo", icon: CheckCircle2 },
    { id: "story", label: "Storytelling", desc: "Narrativa envolvente", icon: BookOpen },
    { id: "case-study", label: "Caso", desc: "Estudo de caso detalhado", icon: BarChart3 },
];

// Content categories
const contentCategories = [
    { id: "technology", label: "Tecnologia", color: "bg-blue-500", icon: Zap },
    { id: "marketing", label: "Marketing", color: "bg-pink-500", icon: Target },
    { id: "business", label: "Negócios", color: "bg-purple-500", icon: TrendingUp },
    { id: "lifestyle", label: "Lifestyle", color: "bg-green-500", icon: Sparkles },
    { id: "education", label: "Educação", color: "bg-yellow-500", icon: BookOpen },
    { id: "health", label: "Saúde", color: "bg-red-500", icon: Heart },
    { id: "finance", label: "Finanças", color: "bg-emerald-500", icon: BarChart3 },
    { id: "entertainment", label: "Entretenimento", color: "bg-orange-500", icon: Sparkles },
];

// Frequency options with descriptions
const frequencyOptions: { value: SitePostFrequency; label: string; desc: string; icon: any }[] = [
    { value: "5hours", label: "A cada 5 horas", desc: "Conteúdo constante", icon: Zap },
    { value: "daily", label: "Diariamente", desc: "Um post por dia", icon: Calendar },
    { value: "weekly", label: "Semanalmente", desc: "Post toda semana", icon: Calendar },
    { value: "biweekly", label: "Quinzenal", desc: "A cada 2 semanas", icon: Calendar },
    { value: "monthly", label: "Mensalmente", desc: "Post mensal", icon: Calendar },
];

// Post length options
const postLengthOptions = [
    { value: "short", label: "Curto", desc: "~800 palavras", time: "3-5 min leitura", icon: AlignLeft },
    { value: "medium", label: "Médio", desc: "~1500 palavras", time: "6-8 min leitura", icon: FileText },
    { value: "long", label: "Longo", desc: "~2500 palavras", time: "10-15 min leitura", icon: BookOpen },
];

// Mock Heart icon since it's not in lucide-react
function Heart({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );
}

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
        fetchStats,
    } = useSiteAutoPost();

    const [isEditing, setIsEditing] = useState(!schedule);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"basic" | "advanced" | "preview">("basic");
    const [previewLangTab, setPreviewLangTab] = useState<"pt" | "en">("pt");
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [copiedContent, setCopiedContent] = useState(false);

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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedContent(true);
        toast.success("Conteúdo copiado!");
        setTimeout(() => setCopiedContent(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        return "text-red-400";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-emerald-500/20";
        if (score >= 60) return "bg-amber-500/20";
        return "bg-red-500/20";
    };

    const locale = i18n.language === "pt" ? "pt-BR" : "en-US";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-2 border-white/10 border-t-emerald-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="space-y-6 pb-10 autopost-theme">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-background to-purple-500/10 border border-white/10 p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{t("dashboard.siteAutoPost.header.title")}</h1>
                            <p className="text-white/60">{t("dashboard.siteAutoPost.header.subtitle")}</p>
                        </div>
                    </div>
                    
                    {schedule && (
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                <Settings className="w-4 h-4" />
                                {isEditing ? "Cancelar Edição" : "Editar Configuração"}
                            </button>
                            <button
                                onClick={handleToggle}
                                disabled={saving}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                    schedule.isActive
                                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                                        : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
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
            </div>

            {/* Stats Dashboard */}
            {stats?.schedule && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Card */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 group hover:border-emerald-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stats.schedule.isActive ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                                    {stats.schedule.isActive ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                                </div>
                                <span className="text-white/60 text-sm">{t("dashboard.siteAutoPost.status.status")}</span>
                            </div>
                            <p className={`text-2xl font-bold ${stats.schedule.isActive ? "text-emerald-400" : "text-amber-400"}`}>
                                {stats.schedule.isActive ? t("dashboard.siteAutoPost.status.active") : t("dashboard.siteAutoPost.status.paused")}
                            </p>
                            <p className="text-white/40 text-sm mt-1">{getFrequencyLabel(stats.schedule.frequency)}</p>
                        </div>
                    </div>

                    {/* Posts This Month */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 group hover:border-blue-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-white/60 text-sm">{t("dashboard.siteAutoPost.status.postsThisMonth")}</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.postsThisMonth}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-all"
                                        style={{ width: `${Math.min((stats.postsThisMonth / (stats.postsThisMonth + stats.remainingPosts)) * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="text-white/40 text-xs">{stats.remainingPosts} restantes</span>
                            </div>
                        </div>
                    </div>

                    {/* Next Post */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 group hover:border-purple-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                </div>
                                <span className="text-white/60 text-sm">{t("dashboard.siteAutoPost.status.nextPost")}</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {stats.nextPostDate
                                    ? new Date(stats.nextPostDate).toLocaleDateString(locale, { day: "numeric", month: "short" })
                                    : "—"}
                            </p>
                            <p className="text-white/40 text-sm mt-1">
                                {stats.nextPostDate
                                    ? new Date(stats.nextPostDate).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                                    : t("dashboard.siteAutoPost.status.notScheduled")}
                            </p>
                        </div>
                    </div>

                    {/* Average Score */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 group hover:border-pink-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition-all"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-pink-400" />
                                </div>
                                <span className="text-white/60 text-sm">Média SEO</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-2xl font-bold text-white">{stats.averageScores?.avgSeoScore || "—"}</p>
                                {stats.averageScores?.avgSeoScore && (
                                    <span className={`text-sm mb-1 ${getScoreColor(stats.averageScores?.avgSeoScore)}`}>
                                        /100
                                    </span>
                                )}
                            </div>
                            <p className="text-white/40 text-sm mt-1">Baseado em {logs.length} posts</p>
                        </div>
                    </div>

                    {/* Average Scores Card */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 group hover:border-pink-500/30 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition-all"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-pink-400" />
                                </div>
                                <span className="text-white/60 text-sm">Média SEO</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-2xl font-bold text-white">{stats?.averageScores?.avgSeoScore || "—"}</p>
                                {stats?.averageScores?.avgSeoScore && (
                                    <span className={`text-sm mb-1 ${getScoreColor(stats.averageScores.avgSeoScore)}`}>
                                        /100
                                    </span>
                                )}
                            </div>
                            <p className="text-white/40 text-sm mt-1">Média dos últimos posts</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {(isEditing || !schedule) ? (
                        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden">
                            {/* Tabs */}
                            <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/[0.02]">
                                <button
                                    onClick={() => setActiveTab("basic")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === "basic"
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    <Settings className="w-4 h-4" />
                                    Básico
                                </button>
                                <button
                                    onClick={() => setActiveTab("advanced")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === "advanced"
                                            ? "bg-purple-500/20 text-purple-400"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Avançado
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    onClick={handleGeneratePreview}
                                    disabled={generatingPreview || !formData.topics}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-50 text-sm font-medium"
                                >
                                    {generatingPreview ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                    {generatingPreview ? "Gerando..." : "Preview"}
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6 space-y-6">
                                {activeTab === "basic" && (
                                    <>
                                        {/* Frequency & Time Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                    <Clock className="w-4 h-4 text-emerald-400" />
                                                    Frequência de Postagem
                                                </label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {frequencyOptions.map((freq) => (
                                                        <button
                                                            key={freq.value}
                                                            onClick={() => setFormData({ ...formData, frequency: freq.value })}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                                                formData.frequency === freq.value
                                                                    ? "border-emerald-500/50 bg-emerald-500/10"
                                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                                            }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                                formData.frequency === freq.value ? "bg-emerald-500/20" : "bg-white/10"
                                                            }`}>
                                                                <freq.icon className={`w-5 h-5 ${
                                                                    formData.frequency === freq.value ? "text-emerald-400" : "text-white/60"
                                                                }`} />
                                                            </div>
                                                            <div>
                                                                <p className={`font-medium ${formData.frequency === freq.value ? "text-white" : "text-white/80"}`}>
                                                                    {freq.label}
                                                                </p>
                                                                <p className="text-xs text-white/50">{freq.desc}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Preferred Time */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                        <Clock className="w-4 h-4 text-purple-400" />
                                                        Horário Preferido
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.preferredTime}
                                                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                                    />
                                                </div>

                                                {/* Post Length */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                        <Type className="w-4 h-4 text-blue-400" />
                                                        Tamanho do Post
                                                    </label>
                                                    <div className="space-y-2">
                                                        {postLengthOptions.map((len) => (
                                                            <button
                                                                key={len.value}
                                                                onClick={() => setFormData({ ...formData, postLength: len.value })}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                                                    formData.postLength === len.value
                                                                        ? "border-blue-500/50 bg-blue-500/10"
                                                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                                                }`}
                                                            >
                                                                <len.icon className={`w-4 h-4 ${formData.postLength === len.value ? "text-blue-400" : "text-white/50"}`} />
                                                                <div className="flex-1">
                                                                    <p className={`text-sm font-medium ${formData.postLength === len.value ? "text-white" : "text-white/80"}`}>
                                                                        {len.label}
                                                                    </p>
                                                                    <p className="text-xs text-white/50">{len.desc} • {len.time}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Topics */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                <Lightbulb className="w-4 h-4 text-yellow-400" />
                                                Tópicos/Temas <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                value={formData.topics}
                                                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                                                placeholder="Ex: Marketing Digital, SEO, Redes Sociais, Empreendedorismo..."
                                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50 transition-all min-h-[100px] resize-none"
                                            />
                                            <p className="text-xs text-white/40 mt-2">
                                                Separe os tópicos por vírgula. A IA usará isso para gerar conteúdo relevante.
                                            </p>
                                        </div>

                                        {/* Keywords & Target Audience */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                    <Hash className="w-4 h-4 text-pink-400" />
                                                    Palavras-chave
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.keywords}
                                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                                    placeholder="marketing digital, SEO, estratégia..."
                                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                    <Target className="w-4 h-4 text-cyan-400" />
                                                    Público-alvo
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.targetAudience}
                                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                                    placeholder="Empreendedores digitais, profissionais..."
                                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === "advanced" && (
                                    <>
                                        {/* Writing Style */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                <Palette className="w-4 h-4 text-purple-400" />
                                                Tom de Voz & Estilo
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {writingStyles.map((style) => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => setFormData({ ...formData, tone: style.id })}
                                                        className={`p-3 rounded-lg border transition-all text-left ${
                                                            formData.tone === style.id
                                                                ? `border-white/30 bg-gradient-to-br ${style.color}`
                                                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                                        }`}
                                                    >
                                                        <span className="text-2xl mb-1 block">{style.icon}</span>
                                                        <p className={`text-sm font-medium ${formData.tone === style.id ? "text-white" : "text-white/80"}`}>
                                                            {style.label}
                                                        </p>
                                                        <p className="text-xs text-white/50">{style.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Structure & Category */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                    <LayoutTemplate className="w-4 h-4 text-orange-400" />
                                                    Estrutura do Post
                                                </label>
                                                <div className="space-y-2">
                                                    {postStructures.map((struct) => (
                                                        <button
                                                            key={struct.id}
                                                            onClick={() => {
                                                    const newCategories = formData.categories?.includes(struct.id)
                                                        ? formData.categories.filter(c => c !== struct.id)
                                                        : [...(formData.categories || []), struct.id];
                                                    setFormData({ ...formData, categories: newCategories });
                                                }}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                                                formData.categories?.includes(struct.id)
                                                                    ? "border-orange-500/50 bg-orange-500/10"
                                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                                            }`}
                                                        >
                                                            {struct.icon && <struct.icon className={`w-4 h-4 ${formData.categories?.includes(struct.id) ? "text-orange-400" : "text-white/50"}`} />}
                                                            <div>
                                                                <p className={`text-sm font-medium ${formData.categories?.includes(struct.id) ? "text-white" : "text-white/80"}`}>
                                                                    {struct.label}
                                                                </p>
                                                                <p className="text-xs text-white/50">{struct.desc}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                                                    <Tag className="w-4 h-4 text-blue-400" />
                                                    Categoria Principal
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {contentCategories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => {
                                                                const newCategories = formData.categories?.includes(cat.id)
                                                                    ? formData.categories.filter(c => c !== cat.id)
                                                                    : [...(formData.categories || []), cat.id];
                                                                setFormData({ ...formData, categories: newCategories });
                                                            }}
                                                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                                                                formData.categories?.includes(cat.id)
                                                                    ? "border-white/30 bg-white/10"
                                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                                            }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded ${cat.color} flex items-center justify-center`}>
                                                                <cat.icon className="w-3 h-3 text-white" />
                                                            </div>
                                                            <span className={`text-sm ${formData.categories?.includes(cat.id) ? "text-white" : "text-white/70"}`}>
                                                                {cat.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.bilingual}
                                                    onChange={(e) => setFormData({ ...formData, bilingual: e.target.checked })}
                                                    className="w-5 h-5 rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Languages className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-white/80">Conteúdo Bilíngue</span>
                                                    </div>
                                                    <p className="text-xs text-white/50">Gera posts em Português e Inglês automaticamente</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categories?.length > 0}
                                                    readOnly
                                                    className="w-5 h-5 rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-pink-400" />
                                                        <span className="text-white/80">Categorias Selecionadas</span>
                                                    </div>
                                                    <p className="text-xs text-white/50">{formData.categories?.length || 0} categorias selecionadas</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
                                                <input
                                                    type="checkbox"
                                                    disabled
                                                    checked={true}
                                                    className="w-5 h-5 rounded border-white/30 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="w-4 h-4 text-pink-400" />
                                                        <span className="text-white/80">Tags Automáticas</span>
                                                    </div>
                                                    <p className="text-xs text-white/50">Gera tags relevantes para cada post automaticamente</p>
                                                </div>
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center justify-between gap-3 p-4 border-t border-white/10 bg-white/[0.02]">
                                {schedule && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </button>
                                )}
                                <div className="flex-1"></div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !formData.topics}
                                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                >
                                    {saving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {saving ? "Salvando..." : schedule ? "Salvar Alterações" : "Criar Automação"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View Mode when not editing */
                        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">Configuração Atual</h3>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                    Editar
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-white/50 text-sm mb-1">Frequência</p>
                                    <p className="text-white font-medium">{frequencyOptions.find(f => f.value === formData.frequency)?.label}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-white/50 text-sm mb-1">Horário</p>
                                    <p className="text-white font-medium">{formData.preferredTime}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-white/50 text-sm mb-1">Tamanho</p>
                                    <p className="text-white font-medium">{postLengthOptions.find(l => l.value === formData.postLength)?.label}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-white/50 text-sm mb-1">Tom de Voz</p>
                                    <p className="text-white font-medium">{writingStyles.find(s => s.id === formData.tone)?.label}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-white/50 text-sm mb-1">Categorias</p>
                                    <p className="text-white font-medium">{formData.categories?.length > 0 ? formData.categories.join(", ") : "Nenhuma"}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5">
                                    <p className="text-white/50 text-sm mb-1">Idioma</p>
                                    <p className="text-white font-medium">{formData.language === "pt" ? "Português" : "Inglês"}</p>
                                </div>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-white/5">
                                <p className="text-white/50 text-sm mb-1">Tópicos</p>
                                <p className="text-white">{formData.topics}</p>
                            </div>
                        </div>
                    )}

                    {/* Recent Posts History */}
                    {logs.length > 0 && (
                        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <History className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Histórico de Posts</h3>
                                        <p className="text-white/50 text-sm">Últimos {logs.length} posts gerados</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="divide-y divide-white/10">
                                {logs.slice(0, 5).map((log) => (
                                    <div key={log.id} className="group">
                                        <button
                                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    log.status === "published" ? "bg-emerald-400" :
                                                    log.status === "failed" ? "bg-red-400" : "bg-amber-400"
                                                }`} />
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="text-white font-medium truncate">{log.generatedTitle}</p>
                                                    <p className="text-white/50 text-sm">
                                                        {new Date(log.createdAt).toLocaleDateString(locale, {
                                                            day: "numeric",
                                                            month: "long",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                        {log.wordCount && ` • ${log.wordCount} palavras`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 ml-4">
                                                {log.seoScore && (
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(log.seoScore)} ${getScoreColor(log.seoScore)}`}>
                                                        SEO {log.seoScore}
                                                    </div>
                                                )}
                                                {expandedLog === log.id ? (
                                                    <ChevronUp className="w-5 h-5 text-white/50" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-white/50" />
                                                )}
                                            </div>
                                        </button>
                                        
                                        {expandedLog === log.id && (
                                            <div className="px-4 pb-4">
                                                <div className="p-4 rounded-lg bg-white/5 space-y-4">
                                                    {log.seoScore && (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <ScoreBadge score={log.seoScore} label="SEO" />
                                                            {log.geoScore && <ScoreBadge score={log.geoScore} label="GEO" />}
                                                            {log.aeoScore && <ScoreBadge score={log.aeoScore} label="AEO" />}
                                                        </div>
                                                    )}
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <p className="text-white/80 line-clamp-3">{log.generatedContent}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm">
                                                            <Eye className="w-4 h-4" />
                                                            Ver completo
                                                        </button>
                                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm">
                                                            <RefreshCw className="w-4 h-4" />
                                                            Regenerar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Tips */}
                    <div className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                            <h4 className="font-semibold text-white">Dicas de Otimização</h4>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-white/70">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                Use tópicos específicos para melhores resultados
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white/70">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                Defina um público-alvo claro
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white/70">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                Experimente diferentes tons de voz
                            </li>
                            <li className="flex items-start gap-2 text-sm text-white/70">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                Ative o conteúdo bilíngue para mais alcance
                            </li>
                        </ul>
                    </div>

                    {/* Metrics Summary */}
                    {logs.length > 0 && (
                        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                <h4 className="font-semibold text-white">Desempenho</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-white/60">Média SEO</span>
                                        <span className="text-white font-medium">{stats?.averageScores?.avgSeoScore || 0}/100</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                                            style={{ width: `${stats?.averageScores?.avgSeoScore || 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-white/60">Taxa de Sucesso</span>
                                        <span className="text-white font-medium">
                                            {Math.round((logs.filter(l => l.status === "published").length / logs.length) * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full transition-all"
                                            style={{ width: `${(logs.filter(l => l.status === "published").length / logs.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Status */}
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">IA Ativa</h4>
                                <p className="text-emerald-400 text-sm">Pronta para gerar conteúdo</p>
                            </div>
                        </div>
                        <p className="text-white/60 text-sm">
                            Nossa IA analisa seus tópicos e gera posts otimizados para SEO automaticamente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Full Screen Preview Modal */}
        </div>
        {showPreview && previewData && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Preview do Post</h3>
                                    <p className="text-white/50">Veja como seu post ficará antes de publicar</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {formData.bilingual && (
                                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                                        <button
                                            onClick={() => setPreviewLangTab("pt")}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                                previewLangTab === "pt"
                                                    ? "bg-emerald-500 text-white"
                                                    : "text-white/60 hover:text-white"
                                            }`}
                                        >
                                            Português
                                        </button>
                                        <button
                                            onClick={() => setPreviewLangTab("en")}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                                previewLangTab === "en"
                                                    ? "bg-emerald-500 text-white"
                                                    : "text-white/60 hover:text-white"
                                            }`}
                                        >
                                            English
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => copyToClipboard(previewLangTab === "pt" ? previewData.content : previewData.contentEn)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-all"
                                >
                                    {copiedContent ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copiedContent ? "Copiado!" : "Copiar"}
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="w-10 h-10 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full">
                                {/* Content Preview */}
                                <div className="lg:col-span-2 p-6 border-r border-white/10">
                                    <div className="max-w-2xl mx-auto">
                                        {/* Title */}
                                        <h1 className="text-3xl font-bold text-white mb-4">
                                            {previewLangTab === "pt" ? previewData.title : previewData.titleEn}
                                        </h1>
                                        
                                        {/* Meta Description */}
                                        <p className="text-lg text-white/60 mb-6 italic border-l-4 border-emerald-500 pl-4">
                                            {previewLangTab === "pt" ? previewData.metaDescription : previewData.metaDescriptionEn}
                                        </p>
                                        
                                        {/* Content */}
                                        <div className="prose prose-invert prose-lg max-w-none">
                                            <MarkdownRenderer 
                                                content={previewLangTab === "pt" ? previewData.content : previewData.contentEn} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Metrics */}
                                <div className="p-6 bg-white/[0.02]">
                                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                                        Métricas
                                    </h4>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className={`p-3 rounded-lg ${getScoreBg(previewData.seoScore)}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/70">SEO Score</span>
                                                <span className={`font-bold ${getScoreColor(previewData.seoScore)}`}>{previewData.seoScore}</span>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg ${getScoreBg(previewData.geoScore)}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/70">GEO Score</span>
                                                <span className={`font-bold ${getScoreColor(previewData.geoScore)}`}>{previewData.geoScore}</span>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg ${getScoreBg(previewData.aeoScore)}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/70">AEO Score</span>
                                                <span className={`font-bold ${getScoreColor(previewData.aeoScore)}`}>{previewData.aeoScore}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Keywords */}
                                    <div className="mb-6">
                                        <h5 className="text-sm font-medium text-white/70 mb-3">Palavras-chave</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {previewData.keywords?.split(",").map((keyword: string, i: number) => (
                                                <span 
                                                    key={i} 
                                                    className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors cursor-pointer"
                                                >
                                                    {keyword.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    {previewData.improvementSuggestions?.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-yellow-400" />
                                                Sugestões
                                            </h5>
                                            <ul className="space-y-2">
                                                {previewData.improvementSuggestions.map((suggestion: string, i: number) => (
                                                    <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                                        <span className="text-yellow-400 mt-0.5">•</span>
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/[0.02]">
                            <p className="text-white/50 text-sm">
                                Este é apenas um preview. O conteúdo final pode variar.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-6 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Fechar
                                </button>
                                {!schedule && (
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Criar Automação
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        )}
        </>
    );
}

// Helper function for frequency labels
function getFrequencyLabel(freq: SitePostFrequency) {
    const labels: Record<SitePostFrequency, string> = {
        "5hours": "A cada 5 horas",
        daily: "Diariamente",
        weekly: "Semanalmente",
        biweekly: "Quinzenal",
        monthly: "Mensalmente",
    };
    return labels[freq];
}

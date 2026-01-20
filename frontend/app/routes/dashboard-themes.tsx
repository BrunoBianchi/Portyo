import { useState, useEffect, useContext, useMemo } from "react";
import type { Route } from "../+types/root";
import { Search, Palette, Lock, Eye, Check, Loader2, X, Sparkles, Crown, ChevronDown, ChevronUp } from "lucide-react";
import AuthContext from "~/contexts/auth.context";
import BioContext, { BioProvider } from "~/contexts/bio.context";
import { api } from "~/services/api";
import { useLocation, useNavigate } from "react-router";
import { PLAN_LIMITS, type PlanType } from "~/constants/plan-limits";
import { UpgradePopup } from "~/components/shared/upgrade-popup";
import { useTranslation } from "react-i18next";
import THEME_PRESETS, { type ThemePreset, type ThemeStyles } from "~/constants/theme-presets";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Themes | Portyo" },
        { name: "description", content: "Browse and apply beautiful themes to your bio" },
    ];
}

const CATEGORIES = [
    { id: "all", name: "All", emoji: "✨" },
    { id: "architecture", name: "Architecture", emoji: "🏛️" },
    { id: "programming", name: "Programming", emoji: "💻" },
    { id: "onlyfans", name: "OnlyFans", emoji: "🔥" },
    { id: "photography", name: "Photography", emoji: "📸" },
    { id: "music", name: "Music", emoji: "🎵" },
    { id: "fitness", name: "Fitness", emoji: "💪" },
    { id: "fashion", name: "Fashion", emoji: "👗" },
    { id: "art", name: "Art", emoji: "🎨" },
    { id: "business", name: "Business", emoji: "💼" },
    { id: "gaming", name: "Gaming", emoji: "🎮" },
    { id: "food", name: "Food", emoji: "🍕" },
    { id: "travel", name: "Travel", emoji: "✈️" }
];

const PRIMARY_CATEGORY_IDS = ["all", "programming", "photography", "business", "music"];

// Tier hierarchy for access control
const tierHierarchy: Record<string, string[]> = {
    free: ["free"],
    standard: ["free", "standard"],
    pro: ["free", "standard", "pro"]
};

interface PreviewModalProps {
    theme: ThemePreset | null;
    isOpen: boolean;
    onClose: () => void;
    onApply: (theme: ThemePreset) => void;
    canAccess: boolean;
    userPlan: string;
    isGuest: boolean;
}

interface ApplyTargetModalProps {
    isOpen: boolean;
    bios: Array<{ id: string; sufix: string }>;
    canCreateNew: boolean;
    onClose: () => void;
    onSelectBio: (bioId: string) => void;
    onCreateNew: () => void;
    isApplying: boolean;
}

function ThemePreviewModal({ theme, isOpen, onClose, onApply, canAccess, userPlan, isGuest }: PreviewModalProps) {
    if (!isOpen || !theme) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
                {/* Preview Section */}
                <div className="flex-1 bg-gray-100 p-6 flex items-center justify-center min-h-[400px] relative">
                    {/* Phone Frame */}
                    <div className="relative w-[280px] h-[560px] bg-black rounded-[3rem] p-3 shadow-2xl">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
                        <div
                            className="w-full h-full rounded-[2.5rem] overflow-hidden"
                            style={{
                                backgroundColor: theme.styles.bgColor
                            }}
                        >
                            {/* Mock Bio Preview */}
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                {/* Profile */}
                                <div
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mb-4"
                                    style={{ borderRadius: theme.styles.cardBorderRadius + 'px' }}
                                />
                                <h3
                                    className="text-lg font-bold mb-2"
                                    style={{
                                        color: theme.styles.usernameColor,
                                        fontFamily: theme.styles.font
                                    }}
                                >
                                    Your Name
                                </h3>
                                <p
                                    className="text-sm opacity-75 mb-6"
                                    style={{ color: theme.styles.usernameColor }}
                                >
                                    Your bio description here
                                </p>

                                {/* Sample Button */}
                                <div
                                    className="w-full max-w-[200px] py-3 px-4 mb-3 text-sm font-medium text-center"
                                    style={{
                                        backgroundColor: theme.styles.cardBackgroundColor,
                                        borderRadius: theme.styles.cardBorderRadius + 'px',
                                        borderWidth: theme.styles.cardBorderWidth + 'px',
                                        borderColor: theme.styles.cardBorderColor,
                                        color: theme.styles.usernameColor,
                                        boxShadow: theme.styles.cardShadow !== 'none' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    My Portfolio
                                </div>
                                <div
                                    className="w-full max-w-[200px] py-3 px-4 mb-3 text-sm font-medium text-center"
                                    style={{
                                        backgroundColor: theme.styles.cardBackgroundColor,
                                        borderRadius: theme.styles.cardBorderRadius + 'px',
                                        borderWidth: theme.styles.cardBorderWidth + 'px',
                                        borderColor: theme.styles.cardBorderColor,
                                        color: theme.styles.usernameColor,
                                        boxShadow: theme.styles.cardShadow !== 'none' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Contact Me
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="w-full md:w-[400px] p-8 flex flex-col">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{theme.emoji}</span>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{theme.name}</h2>
                            <p className="text-sm text-gray-500 capitalize">{theme.category}</p>
                        </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="mb-6">
                        {theme.tier === "free" && (
                            <span className="px-3 py-1 text-xs font-bold uppercase bg-gray-100 text-gray-700 rounded-full">
                                Free
                            </span>
                        )}
                        {theme.tier === "standard" && (
                            <span className="px-3 py-1 text-xs font-bold uppercase bg-[#D7F000] text-black rounded-full">
                                Standard
                            </span>
                        )}
                        {theme.tier === "pro" && (
                            <span className="px-3 py-1 text-xs font-bold uppercase bg-black text-white rounded-full">
                                Pro
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 mb-8 flex-1">{theme.description}</p>

                    {/* Style Preview */}
                    <div className="space-y-4 mb-8">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Theme Colors</h4>
                        <div className="flex gap-3">
                            <div
                                className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                                style={{ backgroundColor: theme.styles.bgColor }}
                                title="Background"
                            />
                            <div
                                className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                                style={{ backgroundColor: theme.styles.cardBackgroundColor }}
                                title="Card Background"
                            />
                            <div
                                className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                                style={{ backgroundColor: theme.styles.usernameColor }}
                                title="Text Color"
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    {isGuest ? (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Sign in to apply
                        </button>
                    ) : canAccess ? (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Apply Theme
                        </button>
                    ) : (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                            <Crown className="w-5 h-5" />
                            Upgrade to {theme.tier === "pro" ? "Pro" : "Standard"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ApplyTargetModal({
    isOpen,
    bios,
    canCreateNew,
    onClose,
    onSelectBio,
    onCreateNew,
    isApplying
}: ApplyTargetModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Aplicar tema</h3>
                        <p className="text-sm text-gray-500">Escolha em qual bio aplicar este tema</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={isApplying}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {bios.length > 0 ? (
                        <div className="space-y-2">
                            {bios.map((bioItem) => (
                                <button
                                    key={bioItem.id}
                                    onClick={() => onSelectBio(bioItem.id)}
                                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                                    disabled={isApplying}
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">/{bioItem.sufix}</p>
                                        <p className="text-xs text-gray-500">Aplicar neste bio</p>
                                    </div>
                                    <Check className="w-4 h-4 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
                            Nenhuma bio encontrada. Crie uma nova para aplicar o tema.
                        </div>
                    )}

                    {canCreateNew && (
                        <div className="pt-2">
                            <button
                                onClick={onCreateNew}
                                className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                disabled={isApplying}
                            >
                                <Sparkles className="w-4 h-4" />
                                Criar nova bio com este tema
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ThemesPage() {
    const { user } = useContext(AuthContext);
    const { bio, bios, createBio, updateBio, selectBio, getBios } = useContext(BioContext);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const safeBios = bios ?? [];

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedPlanFilter, setSelectedPlanFilter] = useState<"all" | "free" | "standard" | "pro">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [forcedPlan, setForcedPlan] = useState<'standard' | 'pro' | undefined>(undefined);
    const [isApplyTargetOpen, setIsApplyTargetOpen] = useState(false);
    const [pendingApplyTheme, setPendingApplyTheme] = useState<ThemePreset | null>(null);
    const [showAllCategories, setShowAllCategories] = useState(false);

    const userPlan = (user?.plan || 'free') as PlanType;
    const allowedTiers = tierHierarchy[userPlan] || tierHierarchy.free;
    const isGuest = !user;
    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1];
    const loginPath = currentLang
        ? `/${currentLang}/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
        : `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

    // Filter themes
    const filteredThemes = useMemo(() => {
        return THEME_PRESETS.filter(theme => {
            const matchesCategory = selectedCategory === "all" || theme.category === selectedCategory;
            const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                theme.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPlan = selectedPlanFilter === "all" || theme.tier === selectedPlanFilter;
            return matchesCategory && matchesSearch && matchesPlan;
        });
    }, [selectedCategory, searchTerm, selectedPlanFilter]);

    const canAccessTheme = (theme: ThemePreset) => {
        return allowedTiers.includes(theme.tier);
    };

    const handlePreview = (theme: ThemePreset) => {
        setSelectedTheme(theme);
        setIsPreviewOpen(true);
    };

    const applyThemeToBio = async (theme: ThemePreset, targetBioId?: string) => {
        setIsApplying(true);
        try {
            const themeStyles = {
                // Background
                bgType: theme.styles.bgType as any,
                bgColor: theme.styles.bgColor,
                bgSecondaryColor: theme.styles.bgSecondaryColor,
                // Card container
                cardStyle: theme.styles.cardStyle as any,
                cardBackgroundColor: theme.styles.cardBackgroundColor,
                cardBorderColor: theme.styles.cardBorderColor,
                cardBorderWidth: theme.styles.cardBorderWidth,
                cardBorderRadius: theme.styles.cardBorderRadius,
                cardShadow: theme.styles.cardShadow as any,
                cardPadding: theme.styles.cardPadding,
                cardOpacity: theme.styles.cardOpacity,
                cardBlur: theme.styles.cardBlur,
                // Typography
                usernameColor: theme.styles.usernameColor,
                font: theme.styles.font,
                // Layout
                maxWidth: theme.styles.maxWidth,
                // Profile
                imageStyle: theme.styles.imageStyle,
                // Parallax
                enableParallax: theme.styles.enableParallax,
                parallaxIntensity: theme.styles.parallaxIntensity,
                parallaxDepth: theme.styles.parallaxDepth,
                // Floating Elements
                floatingElements: theme.styles.floatingElements,
                floatingElementsType: theme.styles.floatingElementsType,
                floatingElementsColor: theme.styles.floatingElementsColor,
                floatingElementsDensity: theme.styles.floatingElementsDensity,
                floatingElementsSize: theme.styles.floatingElementsSize,
                floatingElementsSpeed: theme.styles.floatingElementsSpeed,
                floatingElementsOpacity: theme.styles.floatingElementsOpacity,
                floatingElementsBlur: theme.styles.floatingElementsBlur
            };

            if (targetBioId) {
                // Apply theme to existing bio
                await updateBio(targetBioId, themeStyles);
                const targetBio = bios.find((b) => b.id === targetBioId);
                if (targetBio) selectBio(targetBio);
            } else {
                // Create new bio with theme
                const newSufix = `my-bio-${Date.now()}`;
                await createBio(newSufix);
                // Refresh bios to get the new one
                await getBios();
                // Find and update the newly created bio with theme styles
                const newBioResponse = await api.get("/bio/");
                const newBios = newBioResponse.data;
                const newBio = newBios.find((b: any) => b.sufix === newSufix);
                if (newBio) {
                    await updateBio(newBio.id, themeStyles);
                    selectBio(newBio);
                }
            }

            setIsPreviewOpen(false);
            setIsApplyTargetOpen(false);
            setPendingApplyTheme(null);
            navigate("/dashboard/editor");
        } catch (error) {
            console.error("Failed to apply theme:", error);
        } finally {
            setIsApplying(false);
        }
    };

    const handleApply = async (theme: ThemePreset) => {
        if (!user) {
            navigate(loginPath);
            return;
        }
        if (!canAccessTheme(theme)) {
            setIsPreviewOpen(false);
            if (theme.tier === "pro") {
                setForcedPlan("pro");
            } else {
                setForcedPlan("standard");
            }
            setShowUpgrade(true);
            return;
        }
        const maxBios = PLAN_LIMITS[userPlan]?.bios || 1;
        const hasRoomForNew = safeBios.length < maxBios;

        if (safeBios.length === 0) {
            await applyThemeToBio(theme);
            return;
        }

        setPendingApplyTheme(theme);
        setIsPreviewOpen(false);

        if (!hasRoomForNew) {
            setIsApplyTargetOpen(true);
            return;
        }

        setIsApplyTargetOpen(true);
    };

    const displayedCategories = showAllCategories
        ? CATEGORIES
        : CATEGORIES.filter((category) => PRIMARY_CATEGORY_IDS.includes(category.id));

    return (
        <>
            <UpgradePopup
                isOpen={showUpgrade}
                onClose={() => {
                    setShowUpgrade(false);
                    setForcedPlan(undefined);
                }}
                forcePlan={forcedPlan}
            />

            <ThemePreviewModal
                theme={selectedTheme}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                onApply={handleApply}
                canAccess={selectedTheme ? canAccessTheme(selectedTheme) : false}
                userPlan={userPlan}
                isGuest={isGuest}
            />

            <ApplyTargetModal
                isOpen={isApplyTargetOpen}
                bios={safeBios.map((b) => ({ id: b.id, sufix: b.sufix }))}
                canCreateNew={safeBios.length < (PLAN_LIMITS[userPlan]?.bios || 1)}
                onClose={() => {
                    if (isApplying) return;
                    setIsApplyTargetOpen(false);
                    setPendingApplyTheme(null);
                }}
                onSelectBio={(bioId) => {
                    if (!pendingApplyTheme) return;
                    applyThemeToBio(pendingApplyTheme, bioId);
                }}
                onCreateNew={() => {
                    if (!pendingApplyTheme) return;
                    applyThemeToBio(pendingApplyTheme);
                }}
                isApplying={isApplying}
            />

            <div className="min-h-screen bg-transparent p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">Theme Gallery</h1>
                            <p className="text-gray-500 text-base md:text-lg mt-1">Browse {THEME_PRESETS.length} beautiful themes across {CATEGORIES.length - 1} categories</p>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search themes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                        <div className="rounded-2xl bg-transparent md:flex-1 md:min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                {displayedCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === category.id
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-transparent text-gray-700 hover:border-black/20 hover:text-gray-900"
                                            }`}
                                    >
                                        <span>{category.emoji}</span>
                                        <span>{category.name}</span>
                                    </button>
                                ))}

                                <div className="flex-1" />

                                <button
                                    onClick={() => setShowAllCategories((prev) => !prev)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm font-semibold bg-transparent text-gray-600 hover:text-gray-900 border border-transparent hover:border-black/20 transition-all"
                                >
                                    {showAllCategories ? "Mostrar menos" : "Mostrar mais"}
                                    {showAllCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Plan Filters */}
                        <div className="flex flex-wrap items-center gap-2 md:justify-end md:shrink-0">
                            {[
                                { id: "all", label: "Todos" },
                                { id: "free", label: "Free" },
                                { id: "standard", label: "Standard" },
                                { id: "pro", label: "Pro" }
                            ].map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanFilter(plan.id as "all" | "free" | "standard" | "pro")}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${selectedPlanFilter === plan.id
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-transparent text-gray-600 border-black/10 hover:border-black/20 hover:text-gray-900"
                                        }`}
                                >
                                    {plan.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredThemes.map((theme) => {
                            const hasAccess = canAccessTheme(theme);

                            return (
                                <div
                                    key={`${theme.category}-${theme.name}`}
                                    className="group bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Preview Thumbnail */}
                                    <div
                                        className="h-48 relative overflow-hidden"
                                        style={{ backgroundColor: theme.styles.bgColor }}
                                    >
                                        {/* Mini Preview */}
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <div
                                                className="w-24 h-32 rounded-lg flex flex-col items-center justify-center p-3 transform group-hover:scale-110 transition-transform duration-500"
                                                style={{
                                                    backgroundColor: theme.styles.cardBackgroundColor,
                                                    borderWidth: theme.styles.cardBorderWidth + 'px',
                                                    borderColor: theme.styles.cardBorderColor,
                                                    borderRadius: Math.min(theme.styles.cardBorderRadius, 16) + 'px'
                                                }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full mb-2"
                                                    style={{ backgroundColor: theme.styles.usernameColor, opacity: 0.2 }}
                                                />
                                                <div
                                                    className="w-16 h-2 rounded mb-1"
                                                    style={{ backgroundColor: theme.styles.usernameColor, opacity: 0.3 }}
                                                />
                                                <div
                                                    className="w-12 h-2 rounded"
                                                    style={{ backgroundColor: theme.styles.usernameColor, opacity: 0.2 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Lock Overlay for inaccessible themes */}
                                        {!hasAccess && (
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                                <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                                    <Lock className="w-4 h-4 text-gray-700" />
                                                    <span className="text-sm font-bold text-gray-900 uppercase">
                                                        {theme.tier}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover overlay with Preview button */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => handlePreview(theme)}
                                                className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg hover:bg-gray-100 transition-colors transform translate-y-4 group-hover:translate-y-0"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Preview
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{theme.emoji}</span>
                                                <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                                            </div>

                                            {/* Tier Badge */}
                                            {theme.tier === "free" && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-100 text-gray-600 rounded-full">
                                                    Free
                                                </span>
                                            )}
                                            {theme.tier === "standard" && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#D7F000] text-black rounded-full">
                                                    Standard
                                                </span>
                                            )}
                                            {theme.tier === "pro" && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-black text-white rounded-full">
                                                    Pro
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{theme.description}</p>

                                        {/* Apply Button */}
                                        <button
                                            onClick={() => handleApply(theme)}
                                            disabled={isApplying}
                                            className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${hasAccess
                                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                                                }`}
                                        >
                                            {isApplying ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : isGuest ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Sign in to apply
                                                </>
                                            ) : hasAccess ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    {bio ? "Apply Theme" : "Create Bio with Theme"}
                                                </>
                                            ) : (
                                                <>
                                                    <Crown className="w-4 h-4" />
                                                    Upgrade to Unlock
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {filteredThemes.length === 0 && (
                        <div className="text-center py-20  backdrop-blur-xl rounded-3xl border border-white/60">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Palette className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No themes found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or category filter</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function DashboardThemes() {
    return (
        <BioProvider>
            <ThemesPage />
        </BioProvider>
    );
}

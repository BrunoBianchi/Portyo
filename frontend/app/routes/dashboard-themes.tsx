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
import i18n from "~/i18n";
import THEME_PRESETS, { type ThemePreset, type ThemeStyles } from "~/constants/theme-presets";

export function meta({ params }: Route.MetaArgs) {
    const lang = params?.lang === "pt" ? "pt" : "en";
    return [
        { title: i18n.t("meta.themes.title", { lng: lang }) },
        { name: "description", content: i18n.t("meta.themes.description", { lng: lang }) },
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
    const { t } = useTranslation();
    if (!isOpen || !theme) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface-card w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
                {/* Preview Section */}
                <div className="flex-1 bg-muted p-8 flex items-center justify-center min-h-[350px] relative">
                    {/* Phone Frame */}
                    <div className="relative w-[240px] h-[480px] bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl">
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10" />
                        <div
                            className="w-full h-full rounded-[2rem] overflow-hidden"
                            style={{
                                backgroundColor: theme.styles.bgColor
                            }}
                        >
                            {/* Mock Bio Preview */}
                            <div className="h-full flex flex-col items-center justify-center p-5 text-center">
                                {/* Profile */}
                                <div
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mb-4"
                                    style={{ borderRadius: theme.styles.cardBorderRadius + 'px' }}
                                />
                                <h3
                                    className="text-base font-bold mb-1.5"
                                    style={{
                                        color: theme.styles.usernameColor,
                                        fontFamily: theme.styles.font
                                    }}
                                >
                                    {t("themes.preview.yourName")}
                                </h3>
                                <p
                                    className="text-xs opacity-70 mb-5"
                                    style={{ color: theme.styles.usernameColor }}
                                >
                                    {t("themes.preview.yourBio")}
                                </p>

                                {/* Sample Buttons */}
                                <div
                                    className="w-full max-w-[160px] py-2.5 px-3 mb-2.5 text-xs font-medium text-center"
                                    style={{
                                        backgroundColor: theme.styles.cardBackgroundColor,
                                        borderRadius: theme.styles.cardBorderRadius + 'px',
                                        borderWidth: theme.styles.cardBorderWidth + 'px',
                                        borderColor: theme.styles.cardBorderColor,
                                        color: theme.styles.usernameColor,
                                        boxShadow: theme.styles.cardShadow !== 'none' ? '0 2px 8px -2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    {t("themes.preview.portfolio")}
                                </div>
                                <div
                                    className="w-full max-w-[160px] py-2.5 px-3 text-xs font-medium text-center"
                                    style={{
                                        backgroundColor: theme.styles.cardBackgroundColor,
                                        borderRadius: theme.styles.cardBorderRadius + 'px',
                                        borderWidth: theme.styles.cardBorderWidth + 'px',
                                        borderColor: theme.styles.cardBorderColor,
                                        color: theme.styles.usernameColor,
                                        boxShadow: theme.styles.cardShadow !== 'none' ? '0 2px 8px -2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    {t("themes.preview.contact")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="w-full md:w-[360px] p-6 md:p-8 flex flex-col">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{theme.emoji}</span>
                        <div>
                            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{theme.name}</h2>
                            <p className="text-sm text-muted-foreground capitalize">{theme.category}</p>
                        </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="mb-5">
                        {theme.tier === "free" && (
                            <span className="px-3 py-1 text-xs font-bold uppercase bg-muted text-muted-foreground rounded-full">
                                {t("themes.badges.free")}
                            </span>
                        )}
                        {theme.tier === "standard" && (
                            <span className="px-3 py-1 text-xs font-bold uppercase bg-emerald-100 text-emerald-700 rounded-full">
                                {t("themes.badges.standard")}
                            </span>
                        )}
                        {theme.tier === "pro" && (
                            <span className="px-3 py-1 text-xs font-bold uppercase bg-gray-900 text-white rounded-full">
                                {t("themes.badges.pro")}
                            </span>
                        )}
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{theme.description}</p>

                    {/* Features List */}
                    {theme.features && theme.features.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("themes.preview.features", "Features")}</h4>
                            <div className="flex flex-wrap gap-2">
                                {theme.features.map((feature, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Preview */}
                    <div className="space-y-3 mb-6">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("themes.preview.colors")}</h4>
                        <div className="flex gap-2">
                            {theme.colors ? (
                                theme.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full border border-border shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))
                            ) : (
                                <>
                                    <div
                                        className="w-10 h-10 rounded-full border border-border shadow-sm"
                                        style={{ backgroundColor: theme.styles.bgColor }}
                                        title={t("themes.preview.background")}
                                    />
                                    <div
                                        className="w-10 h-10 rounded-full border border-border shadow-sm"
                                        style={{ backgroundColor: theme.styles.cardBackgroundColor }}
                                        title={t("themes.preview.card")}
                                    />
                                    <div
                                        className="w-10 h-10 rounded-full border border-border shadow-sm"
                                        style={{ backgroundColor: theme.styles.usernameColor }}
                                        title={t("themes.preview.text")}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    {isGuest ? (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98]"
                        >
                            {t("themes.actions.signInToApply")}
                        </button>
                    ) : canAccess ? (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <Check className="w-5 h-5" />
                            {t("themes.actions.applyTheme")}
                        </button>
                    ) : (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-gray-900 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                        >
                            <Crown className="w-5 h-5" />
                            {t("themes.actions.upgradeTo", { plan: t(`themes.badges.${theme.tier}`) })}
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
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-2xl bg-surface-card shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">{t("themes.applyModal.title")}</h3>
                        <p className="text-sm text-muted-foreground">{t("themes.applyModal.subtitle")}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
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
                                    className="w-full flex items-center justify-between rounded-xl border border-border px-4 py-3 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                                    disabled={isApplying}
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">/{bioItem.sufix}</p>
                                        <p className="text-xs text-muted-foreground">{t("themes.actions.applyToBio")}</p>
                                    </div>
                                    <Check className="w-4 h-4 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                            {t("themes.applyModal.noBios")}
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
                                {t("themes.actions.createNewBio")}
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
                floatingElementsBlur: theme.styles.floatingElementsBlur,
                // New Properties
                buttonStyle: theme.styles.buttonStyle as any,
                customFontUrl: theme.styles.customFontUrl,
                customFontName: theme.styles.customFontName
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

            <div className="min-h-screen  p-4 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Header - Minimal & Elegant */}
                    <div className="text-center max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                            {t("themes.title")}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {t("themes.subtitle", { count: THEME_PRESETS.length })}
                        </p>
                    </div>

                    {/* Search - Centered & Clean */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={t("themes.searchPlaceholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-surface-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    {/* Filters - Horizontal Pills */}
                    <div className="space-y-4">
                        {/* Categories */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {displayedCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category.id
                                        ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                                        : "bg-surface-card text-muted-foreground hover:bg-muted border border-border"
                                        }`}
                                >
                                    <span>{category.emoji}</span>
                                    <span>{t(`themes.categories.${category.id}`, { defaultValue: category.name })}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setShowAllCategories((prev) => !prev)}
                                className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showAllCategories ? t("themes.filters.less") : t("themes.filters.more")}
                                {showAllCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Plan Filters - Secondary */}
                        <div className="flex items-center justify-center gap-1 bg-muted rounded-full p-1 max-w-fit mx-auto">
                            {[
                                { id: "all", label: t("themes.filters.plans.all") },
                                { id: "free", label: t("themes.filters.plans.free") },
                                { id: "standard", label: t("themes.filters.plans.standard") },
                                { id: "pro", label: t("themes.filters.plans.pro") }
                            ].map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanFilter(plan.id as "all" | "free" | "standard" | "pro")}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedPlanFilter === plan.id
                                        ? "bg-surface-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-gray-700"
                                        }`}
                                >
                                    {plan.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme Grid - Clean Cards */}
                    <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredThemes.map((theme) => {
                            const hasAccess = canAccessTheme(theme);

                            return (
                                <div
                                    key={`${theme.category}-${theme.name}`}
                                    className="group bg-surface-card rounded-2xl border border-border overflow-hidden hover:border-border hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                                >
                                    {/* Preview Thumbnail */}
                                    <div
                                        className="aspect-[4/3] relative overflow-hidden cursor-pointer"
                                        onClick={() => handlePreview(theme)}
                                        style={{ backgroundColor: theme.styles.bgColor }}
                                    >
                                        {/* Mini Preview */}
                                        <div className="absolute inset-0 flex items-center justify-center p-6">
                                            <div
                                                className="w-20 h-28 flex flex-col items-center justify-center p-3 transform group-hover:scale-105 transition-transform duration-300"
                                                style={{
                                                    backgroundColor: theme.styles.cardBackgroundColor,
                                                    borderWidth: theme.styles.cardBorderWidth + 'px',
                                                    borderColor: theme.styles.cardBorderColor,
                                                    borderRadius: Math.min(theme.styles.cardBorderRadius, 12) + 'px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                                }}
                                            >
                                                <div
                                                    className="w-7 h-7 rounded-full mb-2"
                                                    style={{ backgroundColor: theme.styles.usernameColor, opacity: 0.15 }}
                                                />
                                                <div
                                                    className="w-12 h-1.5 rounded-full mb-1"
                                                    style={{ backgroundColor: theme.styles.usernameColor, opacity: 0.25 }}
                                                />
                                                <div
                                                    className="w-8 h-1.5 rounded-full"
                                                    style={{ backgroundColor: theme.styles.usernameColor, opacity: 0.15 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Lock Badge */}
                                        {!hasAccess && (
                                            <div className="absolute top-3 right-3">
                                                <div className="bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                    <Lock className="w-3 h-3 text-white" />
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                                                        {t(`themes.badges.${theme.tier}`)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Preview Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                <div className="bg-surface-card/95 backdrop-blur-sm text-foreground px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg">
                                                    <Eye className="w-4 h-4" />
                                                    {t("themes.actions.preview")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Info */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-base flex-shrink-0">{theme.emoji}</span>
                                                <h3 className="font-semibold text-foreground truncate">{theme.name}</h3>
                                            </div>

                                            {/* Tier Badge - Minimal */}
                                            {theme.tier !== "free" && (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full flex-shrink-0 ${theme.tier === "standard"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-gray-900 text-white"
                                                    }`}>
                                                    {t(`themes.badges.${theme.tier}`)}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{theme.description}</p>

                                        {/* Apply Button - Green to Black Gradient for Upgrade */}
                                        <button
                                            onClick={() => handleApply(theme)}
                                            disabled={isApplying}
                                            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${hasAccess
                                                ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                                                : "bg-gradient-to-r from-emerald-500 to-gray-900 text-white hover:from-emerald-600 hover:to-black active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                                                }`}
                                        >
                                            {isApplying ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : isGuest ? (
                                                <>{t("themes.actions.signInToApply")}</>
                                            ) : hasAccess ? (
                                                <>{t("themes.actions.apply")}</>
                                            ) : (
                                                <>
                                                    <Crown className="w-4 h-4" />
                                                    {t("themes.actions.unlock")}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State - Minimal */}
                    {filteredThemes.length === 0 && (
                        <div className="text-center py-24">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                <Palette className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">{t("themes.empty.title")}</h3>
                            <p className="text-muted-foreground text-sm">{t("themes.empty.subtitle")}</p>
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

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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                {/* Preview Section */}
                <div className="flex-1 bg-[#F3F3F1] p-8 flex items-center justify-center min-h-[350px] relative border-b-4 md:border-b-0 md:border-r-4 border-black">
                    {/* Phone Frame */}
                    <div className="relative w-[240px] h-[480px] bg-black rounded-[2.5rem] p-2.5 shadow-2xl">
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
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
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/30 mb-4"
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
                <div className="w-full md:w-[360px] p-6 md:p-8 flex flex-col bg-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2.5 hover:bg-black hover:text-white rounded-full transition-colors border-2 border-transparent hover:border-black"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{theme.emoji}</span>
                        <div>
                            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{theme.name}</h2>
                            <p className="text-sm text-gray-500 font-bold capitalize tracking-wide">{theme.category}</p>
                        </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="mb-6">
                        {theme.tier === "free" && (
                            <span className="px-3 py-1 text-xs font-black uppercase bg-gray-100 text-gray-500 rounded-full border-2 border-gray-200">
                                {t("themes.badges.free")}
                            </span>
                        )}
                        {theme.tier === "standard" && (
                            <span className="px-3 py-1 text-xs font-black uppercase bg-emerald-100 text-emerald-700 rounded-full border-2 border-emerald-200">
                                {t("themes.badges.standard")}
                            </span>
                        )}
                        {theme.tier === "pro" && (
                            <span className="px-3 py-1 text-xs font-black uppercase bg-black text-white rounded-full border-2 border-black">
                                {t("themes.badges.pro")}
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm font-medium leading-relaxed mb-8 flex-1">{theme.description}</p>

                    {/* Features List */}
                    {theme.features && theme.features.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-3">{t("themes.preview.features", "Features")}</h4>
                            <div className="flex flex-wrap gap-2">
                                {theme.features.map((feature, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-[#F3F3F1] text-[#1A1A1A] text-xs font-bold rounded-lg border-2 border-transparent">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Preview */}
                    <div className="space-y-3 mb-8">
                        <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">{t("themes.preview.colors")}</h4>
                        <div className="flex gap-2">
                            {theme.colors ? (
                                theme.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))
                            ) : (
                                <>
                                    <div
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm"
                                        style={{ backgroundColor: theme.styles.bgColor }}
                                        title={t("themes.preview.background")}
                                    />
                                    <div
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm"
                                        style={{ backgroundColor: theme.styles.cardBackgroundColor }}
                                        title={t("themes.preview.card")}
                                    />
                                    <div
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm"
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
                            className="w-full py-4 bg-black text-white font-black rounded-xl hover:bg-[#333] transition-all active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            {t("themes.actions.signInToApply")}
                        </button>
                    ) : canAccess ? (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-4 bg-[#C6F035] text-black font-black rounded-xl hover:bg-[#d9fc5c] transition-all flex items-center justify-center gap-2 active:scale-[0.98] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            <Check className="w-5 h-5" strokeWidth={3} />
                            {t("themes.actions.applyTheme")}
                        </button>
                    ) : (
                        <button
                            onClick={() => onApply(theme)}
                            className="w-full py-4 bg-black text-white font-black rounded-xl hover:bg-[#333] transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-[0.98]"
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-[32px] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-8 py-6 border-b-2 border-black/5">
                    <div>
                        <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("themes.applyModal.title")}</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">{t("themes.applyModal.subtitle")}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black"
                        disabled={isApplying}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-8 py-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {bios.length > 0 ? (
                        <div className="space-y-3">
                            {bios.map((bioItem) => (
                                <button
                                    key={bioItem.id}
                                    onClick={() => onSelectBio(bioItem.id)}
                                    className="w-full flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
                                    disabled={isApplying}
                                >
                                    <div>
                                        <p className="text-base font-black text-[#1A1A1A] group-hover:text-black">/{bioItem.sufix}</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{t("themes.actions.applyToBio")}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#F3F3F1] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        <Check className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center bg-[#F3F3F1]">
                            <p className="text-base font-bold text-gray-500">{t("themes.applyModal.noBios")}</p>
                        </div>
                    )}

                    {canCreateNew && (
                        <div className="pt-2">
                            <button
                                onClick={onCreateNew}
                                className="w-full py-4 rounded-xl bg-[#1A1A1A] text-white font-black hover:bg-black transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
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
                customFontName: theme.styles.customFontName,
                // Button styles
                buttonColor: theme.styles.buttonColor,
                buttonTextColor: theme.styles.buttonTextColor
            };

            if (targetBioId) {
                // Apply theme to existing bio
                const targetBio = bios.find((b) => b.id === targetBioId);
                if (targetBio) {
                    // Create updated bio object with new theme styles
                    const updatedBio = { ...targetBio, ...themeStyles };
                    
                    // Regenerate HTML from blocks with new theme styles
                    const { blocksToHtml } = await import("~/services/html-generator");
                    const regeneratedHtml = await blocksToHtml(
                        targetBio.blocks || [],
                        user,
                        updatedBio
                    );
                    
                    // Update bio with both theme styles and regenerated HTML
                    await updateBio(targetBioId, {
                        ...themeStyles,
                        html: regeneratedHtml
                    });
                    
                    selectBio(targetBio);
                }
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

            <div className="min-h-screen bg-[#F3F3F1] text-[#1A1A1A] pb-20">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-14 md:pt-20">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>
                            {t("themes.title", "Designs que convertem")}
                        </h1>
                        <p className="text-base md:text-lg text-[#1A1A1A]/60 font-medium max-w-2xl mx-auto">
                            {t("themes.subtitle", { count: THEME_PRESETS.length })}
                        </p>
                    </div>

                    <div className="max-w-xl mx-auto mt-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/40" />
                            <input
                                type="text"
                                placeholder={t("themes.searchPlaceholder", "Buscar estilo...")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#1A1A1A]/15 focus:border-[#1A1A1A]/50 rounded-full focus:outline-none transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
                            />
                        </div>
                    </div>

                    <div className="flex overflow-x-auto pt-8 gap-2.5 no-scrollbar justify-start lg:justify-center">
                        {displayedCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${selectedCategory === category.id
                                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                    : "bg-white text-[#1A1A1A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]/35"
                                    }`}
                            >
                                <span className={selectedCategory === category.id ? "grayscale-0" : "grayscale opacity-75"}>{category.emoji}</span>
                                <span>{t(`themes.categories.${category.id}`, { defaultValue: category.name })}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => setShowAllCategories((prev) => !prev)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-full text-sm font-semibold bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 hover:border-[#1A1A1A]/35 transition-all"
                        >
                            {showAllCategories ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4 mb-8">
                        {(["all", "free", "standard", "pro"] as const).map((tier) => (
                            <button
                                key={tier}
                                onClick={() => setSelectedPlanFilter(tier)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-colors ${selectedPlanFilter === tier
                                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                    : "bg-white text-[#1A1A1A]/70 border-[#1A1A1A]/15 hover:border-[#1A1A1A]/35"
                                    }`}
                            >
                                {tier === "all" ? t("themes.filters.all", "All") : t(`themes.badges.${tier}`)}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8">
                        {filteredThemes.map((theme) => {
                            const hasAccess = canAccessTheme(theme);
                            const cardTextColor = theme.styles.usernameColor || "#1A1A1A";
                            const cardAccentColor = theme.styles.buttonColor || theme.styles.cardBorderColor || "#D2E823";
                            const cardBackground = theme.styles.bgType === "gradient"
                                ? { background: theme.styles.bgColor }
                                : { backgroundColor: theme.styles.bgColor };

                            return (
                                <div
                                    key={`${theme.category}-${theme.name}`}
                                    className="group flex flex-col gap-2.5 cursor-pointer"
                                    onClick={() => handlePreview(theme)}
                                >
                                    <div
                                        className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-[#1A1A1A]/15 hover:border-[#1A1A1A]/35"
                                        style={cardBackground}
                                    >
                                        {theme.tier === "pro" && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#D2E823] rounded-full flex items-center justify-center z-20 shadow-md border border-black/10">
                                                <Sparkles className="w-3.5 h-3.5 text-black" />
                                            </div>
                                        )}

                                        <div
                                            className="w-full h-full relative flex flex-col items-center justify-center p-4"
                                            style={{
                                                backgroundImage: `radial-gradient(circle at 2px 2px, ${cardTextColor}14 1.5px, transparent 0)`,
                                                backgroundSize: "14px 14px"
                                            }}
                                        >
                                            <div
                                                className="text-4xl font-bold transition-transform group-hover:scale-110"
                                                style={{ color: cardTextColor }}
                                            >
                                                Aa
                                            </div>

                                            <div
                                                className="w-14 h-4 rounded-full mt-3 shadow-sm"
                                                style={{ background: cardAccentColor }}
                                            />

                                            {/* Floating Elements (Visual Decoration Only) */}
                                            {theme.styles.floatingElements && (
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                    <div className="absolute top-[10%] left-[-10%] w-20 h-20 rounded-full blur-xl opacity-30" style={{ backgroundColor: theme.styles.floatingElementsColor }}></div>
                                                    <div className="absolute bottom-[20%] right-[-10%] w-24 h-24 rounded-full blur-xl opacity-30" style={{ backgroundColor: theme.styles.floatingElementsColor }}></div>
                                                </div>
                                            )}

                                            {/* Lock Overlay */}
                                            {!hasAccess && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30">
                                                    <div className="bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-white/20">
                                                        <Lock className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-wider">{t(`themes.badges.${theme.tier}`)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute bottom-0 left-0 right-0 py-2.5 px-3 text-center bg-gradient-to-t from-black/20 to-transparent">
                                                <span className="text-xs font-semibold" style={{ color: cardTextColor }}>
                                                    {theme.name}
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="flex gap-1.5 justify-center mt-1">
                                            {theme.tier === "pro" && <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.5 rounded-full uppercase">PRO</span>}
                                            {theme.tier === "standard" && <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase">STANDARD</span>}
                                            {theme.tier === "free" && <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full uppercase">FREE</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredThemes.length === 0 && (
                        <div className="text-center py-32">
                            <div className="bg-[#F3F3F1] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Palette className="w-8 h-8 text-[#1A1A1A]/40" />
                            </div>
                            <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">{t("themes.empty.title")}</h3>
                            <p className="text-[#1A1A1A]/60 font-medium">{t("themes.empty.subtitle")}</p>
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

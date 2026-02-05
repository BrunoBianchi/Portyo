import { Link, useLocation } from "react-router";
import { useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import AuthContext from "~/contexts/auth.context";
import BioContext from "~/contexts/bio.context";
import {
    LayoutDashboard,
    PenTool,
    LogOut,
    Globe,
    ChevronDown,
    Plus,
    Check,
    X,
    Sparkles,
    BarChart3,
    Users,
    Zap,
    Puzzle,
    CreditCard,
    ShoppingBag,
    FileText,
    QrCode,
    Bell,
    Calendar,
    LayoutTemplate,
    Lock,
    Megaphone,
    Shield,
    TrendingUp,
    Bot,
    ChevronRight,
    Briefcase,
    Store,
    Home,
    MessageSquare,
    Mail,
    Globe2,
    Settings,
    ArrowRight,
    CheckCircle2,
    Circle,
    ExternalLinkIcon,
    Palette
} from "lucide-react";
import { PLAN_LIMITS } from "~/constants/plan-limits";
import type { PlanType } from "~/constants/plan-limits";
import { useTranslation } from "react-i18next";
import { UpgradePopup } from "~/components/shared/upgrade-popup";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "./notification-bell";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    handleChangeBio?: () => void;
}

// Donut Chart Removed


export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const { bio, bios, createBio, selectBio } = useContext(BioContext);
    const { i18n, t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState("");

    const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);
    const [forcedPlan, setForcedPlan] = useState<'standard' | 'pro' | undefined>(undefined);

    // Collapsible sections state
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        myPortyo: true,
        earn: true,
        audience: false,
        tools: false,
        admin: true
    });

    const toggleGroup = (groupKey: string) => {
        setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    const dropdownRef = useRef<HTMLDivElement>(null);

    const pathnameNoLang = location.pathname.replace(/^\/(en|pt)(?=\/|$)/, "");
    const isActive = (path: string) => {
        if (path === "/dashboard") {
            return pathnameNoLang === "/dashboard";
        }
        return pathnameNoLang === path || pathnameNoLang.startsWith(path + "/");
    };
    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1] || i18n.resolvedLanguage || i18n.language || "en";

    const withLang = (to: string) => {
        if (to.startsWith("http")) return to;
        if (/^\/(en|pt)(\/|$)/.test(to)) return to;
        return to === "/" ? `/${currentLang}` : `/${currentLang}${to}`;
    };

    function normalizeUsername(value: string) {
        return value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/^-+/, "")
            .replace(/-+/g, "-");
    }

    const isUsernameValid = newUsername.length >= 3 && !newUsername.endsWith("-");

    const userPlan = (user?.plan || 'free') as PlanType;
    const bioLimit = PLAN_LIMITS[userPlan]?.bios || 1;
    const canCreateBio = bios.length < bioLimit;

    // --- Onboarding Logic ---
    const [onboardingState, setOnboardingState] = useState({
        hasLink: false,
        visitedPages: false,
        visitedSettings: false,
        visitedBio: false
    });

    useEffect(() => {
        // Load initial state from local storage
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("portyo:onboarding-state");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Merge with current derived state (hasLink should always be fresh)
                    setOnboardingState(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to parse onboarding state", e);
                }
            }
        }
    }, [user?.id]); // Re-run if user changes

    useEffect(() => {
        if (!bio) return;

        // 1. Check for links (derived from bio prop)
        const hasContent = (bio.blocks && bio.blocks.length > 0) || false;

        let newState = { ...onboardingState };
        let hasChanged = false;

        if (hasContent !== newState.hasLink) {
            newState.hasLink = hasContent;
            hasChanged = true;
        }

        // 2. Track visited pages (basic logic: if path is NOT dashboard root, count as visited pages)
        // Allow /dashboard/editor, /dashboard/portfolio etc.
        if (pathnameNoLang !== "/dashboard" && !newState.visitedPages) {
            newState.visitedPages = true;
            hasChanged = true;
        }

        // 3. Track settings visit
        if (pathnameNoLang.includes("/settings") && !newState.visitedSettings) {
            newState.visitedSettings = true;
            hasChanged = true;
        }

        if (hasChanged) {
            setOnboardingState(newState);
            localStorage.setItem("portyo:onboarding-state", JSON.stringify(newState));
        }

    }, [bio, pathnameNoLang]);

    const handleVisitBio = () => {
        if (!onboardingState.visitedBio) {
            const newState = { ...onboardingState, visitedBio: true };
            setOnboardingState(newState);
            localStorage.setItem("portyo:onboarding-state", JSON.stringify(newState));
        }
    };

    const calculateProgress = () => {
        let completed = 0;
        if (onboardingState.hasLink) completed++;
        if (onboardingState.visitedPages) completed++;
        if (onboardingState.visitedSettings) completed++;
        if (onboardingState.visitedBio) completed++;
        return (completed / 4) * 100;
    };

    const progress = calculateProgress();
    const isSetupComplete = progress === 100;

    // Helper for next step
    const getNextStep = () => {
        if (!onboardingState.hasLink) return {
            label: t("dashboard.sidebar.steps.actionAddLink", { defaultValue: "Add Link" }),
            action: () => {
                // Open editor if in editor, or navigate there
                if (location.pathname.includes("/dashboard/editor")) {
                    setIsCreateModalOpen(true); // Fallback if no direct "add" trigger, but ideally navigate to links tab
                } else {
                    navigate("/dashboard/editor");
                }
            },
            icon: Plus
        };
        if (!onboardingState.visitedPages) return {
            label: t("dashboard.sidebar.steps.actionExplore", { defaultValue: "Explore Dashboard" }),
            action: () => navigate("/dashboard/analytics"), // Example destination
            icon: LayoutDashboard // Changed from Compass (not imported) to LayoutDashboard
        };
        if (!onboardingState.visitedSettings) return {
            label: t("dashboard.sidebar.steps.actionSettings", { defaultValue: "Go to Settings" }),
            action: () => navigate("/dashboard/settings"),
            icon: Settings
        };
        if (!onboardingState.visitedBio) return {
            label: t("dashboard.sidebar.steps.actionVisitBio", { defaultValue: "Visit your Bio" }),
            action: handleVisitBio,
            icon: ExternalLinkIcon // Need to import this or use Globe
        };
        return null;
    };

    // Import navigate
    const navigate = (path: string) => {
        window.location.href = withLang(path);
    };

    const nextStep = getNextStep();

    // --- End Onboarding Logic ---

    const handleCreateBio = async () => {
        if (!canCreateBio) {
            setIsCreateModalOpen(false);
            if (userPlan === 'standard') {
                setForcedPlan('pro');
            }
            setIsUpgradePopupOpen(true);
            return;
        }
        if (!isUsernameValid) return;
        setCreateError(null);
        try {
            await createBio(newUsername);
            setIsCreateModalOpen(false);
            setNewUsername("");
        } catch (error: any) {
            console.error("Failed to create bio", error);
            setCreateError(error.response?.data?.message || t("dashboard.sidebar.createError"));
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navGroups = [
        {
            key: "myPortyo",
            label: t("dashboard.sidebar.groupMyPortyo", { defaultValue: "MY PORTYO" }),
            items: [
                { name: t("dashboard.nav.overview", { defaultValue: "Overview" }), path: "/dashboard", icon: LayoutDashboard, tourId: "dashboard-nav-overview" },
                { name: t("dashboard.nav.editor", { defaultValue: "Editor" }), path: "/dashboard/editor", icon: PenTool, tourId: "dashboard-nav-editor" },
                { name: t("dashboard.nav.design", { defaultValue: "Design" }), path: "/dashboard/design", icon: Palette },
                { name: t("dashboard.nav.portfolio", { defaultValue: "Portfolio" }), path: "/dashboard/portfolio", icon: Briefcase },
                { name: t("dashboard.nav.blog", { defaultValue: "Blog" }), path: "/dashboard/blog", icon: FileText },
                { name: t("dashboard.nav.products", { defaultValue: "Products" }), path: "/dashboard/products", icon: Store, tourId: "dashboard-nav-products" },
            ]
        },
        {
            key: "earn",
            label: t("dashboard.sidebar.groupEarn", { defaultValue: "EARN" }),
            items: [
                { name: t("dashboard.nav.marketing", { defaultValue: "Marketing" }), path: "/dashboard/marketing", icon: TrendingUp, isPro: true },
                { name: t("dashboard.nav.scheduler", { defaultValue: "Scheduler" }), path: "/dashboard/scheduler", icon: Calendar, isPro: true, isProOnly: true },
            ]
        },
        {
            key: "audience",
            label: t("dashboard.sidebar.groupAudience", { defaultValue: "AUDIENCE" }),
            items: [
                { name: t("dashboard.nav.analytics", { defaultValue: "Analytics" }), path: "/dashboard/analytics", icon: BarChart3, isPro: true },
                { name: t("dashboard.nav.leads", { defaultValue: "Leads" }), path: "/dashboard/leads", icon: Users, isPro: true },
                { name: t("dashboard.nav.forms", { defaultValue: "Forms" }), path: "/dashboard/forms", icon: MessageSquare, tourId: "dashboard-nav-forms" },
            ]
        },
        {
            key: "tools",
            label: t("dashboard.sidebar.groupTools", { defaultValue: "TOOLS" }),
            items: [
                { name: t("dashboard.nav.autoPost", { defaultValue: "Auto Post" }), path: "/dashboard/auto-post", icon: Bot, isPro: true, isProOnly: true },
                { name: t("dashboard.nav.emailTemplates", { defaultValue: "Email Templates" }), path: "/dashboard/templates", icon: Mail, isPro: true, isProOnly: true },
                { name: t("dashboard.nav.automation", { defaultValue: "Automation" }), path: "/dashboard/automation", icon: Zap, isPro: true },
                { name: t("dashboard.nav.integrations", { defaultValue: "Integrations" }), path: "/dashboard/integrations", icon: Puzzle, tourId: "dashboard-nav-integrations" },
                { name: t("dashboard.nav.qrCode", { defaultValue: "QR Codes" }), path: "/dashboard/qrcode", icon: QrCode },
                { name: t("dashboard.nav.customDomains", { defaultValue: "Custom Domains" }), path: "/dashboard/custom-domains", icon: Globe2, isPro: true },
            ]
        }
    ];

    if (user?.email?.toLowerCase() === "bruno2002.raiado@gmail.com") {
        // @ts-ignore
        navGroups.push({
            key: "admin",
            label: "ADMIN",
            // @ts-ignore
            items: [
                { name: t("dashboard.nav.adminPanel", { defaultValue: "Admin Panel" }), path: "/dashboard/admin", icon: Shield },
                { name: t("dashboard.nav.announcements", { defaultValue: "Announcements" }), path: "/dashboard/announcements", icon: Megaphone },
                { name: t("dashboard.nav.siteBlog", { defaultValue: "Site Blog" }), path: "/dashboard/site-blog", icon: Globe },
            ]
        });
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[45] md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <UpgradePopup
                isOpen={isUpgradePopupOpen}
                onClose={() => {
                    setIsUpgradePopupOpen(false);
                    setForcedPlan(undefined);
                }}
                forcePlan={forcedPlan}
            />

            {/* Create Bio Modal - Keeping functionality */}
            {isCreateModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="bg-white w-full max-w-[480px] rounded-[32px] p-8 relative z-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#D2E823] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider mb-4">
                                    <Sparkles className="w-3 h-3" />
                                    {t("dashboard.sidebar.newPage")}
                                </div>
                                <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.sidebar.claimTitle")}</h2>
                                <p className="text-gray-500 mt-2 text-base font-bold">{t("dashboard.sidebar.claimSubtitle")}</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black border-2 border-transparent hover:border-black">
                                <X className="w-6 h-6" strokeWidth={3} />
                            </button>
                        </div>
                        {createError && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-600 rounded-xl text-sm font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-center gap-2">
                                <X className="w-4 h-4" strokeWidth={3} />
                                {createError}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div className="relative group">
                                <div className="flex items-center bg-white rounded-2xl h-[72px] px-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:translate-x-[-2px] focus-within:translate-y-[-2px] transition-all duration-200">
                                    <Globe className="w-6 h-6 text-black shrink-0 mr-4 stroke-[2.5px]" />
                                    <div className="flex-1 flex items-center h-full relative">
                                        <span className="text-xl md:text-2xl font-black text-gray-400 select-none tracking-tight shrink-0 pl-1">portyo.me/p/</span>
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => {
                                                setNewUsername(normalizeUsername(e.target.value));
                                                setCreateError(null);
                                            }}
                                            placeholder={t("dashboard.sidebar.usernamePlaceholder")}
                                            className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl font-black text-[#1A1A1A] placeholder:text-gray-200 h-full text-left pl-0.5 tracking-tight w-full min-w-0"
                                            autoFocus
                                            spellCheck={false}
                                        />
                                    </div>
                                    <div className={`ml-4 transition-all duration-300 ${isUsernameValid || createError ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                        {createError ? (
                                            <div className="bg-red-500 rounded-full p-1 text-white shadow-sm border-2 border-black"><X className="w-4 h-4" strokeWidth={3} /></div>
                                        ) : (
                                            <div className="bg-[#D2E823] rounded-full p-1 text-black shadow-sm border-2 border-black"><Check className="w-4 h-4" strokeWidth={4} /></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled={!isUsernameValid}
                                onClick={handleCreateBio}
                                className="w-full h-[60px] bg-[#1A1A1A] text-white hover:bg-black rounded-2xl flex items-center justify-center gap-3 font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                            >
                                <span>{t("dashboard.sidebar.createPage")}</span>
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}

            <aside
                data-tour="dashboard-sidebar"
                className={`
                    w-64 h-screen flex flex-col fixed left-0 top-0 z-50 bg-[#F3F3F1] 
                    transition-transform duration-300 ease-out border-r border-[#E5E5E5]
                    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
                    md:translate-x-0 md:shadow-none font-sans
                `}
            >
                {/* Header: Profile & Notifications */}
                <div className="p-5 flex items-center justify-between">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 hover:bg-black/5 p-2 rounded-2xl transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-500 overflow-hidden shadow-sm group-hover:border-gray-300 transition-colors">
                                {user?.fullname?.[0]?.toUpperCase() || <Globe className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-sm font-bold truncate w-24 text-left text-[#1a1a1a]">
                                    {user?.fullname || user?.email?.split('@')[0]}
                                </span>
                                <span className="text-sm text-gray-500 truncate w-full text-left font-medium">
                                    {bio?.sufix ? `@${bio.sufix}` : t("dashboard.sidebar.selectPage")}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden z-50 p-2"
                                >
                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        {t("dashboard.sidebar.yourPages")}
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto space-y-1 custom-scrollbar">
                                        {bios.length > 0 && bios.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => {
                                                    selectBio(b);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${bio?.id === b.id ? 'bg-[#C6F035]/20 text-black font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                                            >
                                                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${bio?.id === b.id ? 'bg-[#C6F035] text-black' : 'bg-gray-100 text-gray-400'}`}>
                                                    <span className="text-xs font-bold">{b.sufix[0].toUpperCase()}</span>
                                                </div>
                                                <span className="text-sm truncate flex-1">{b.sufix}</span>
                                                {bio?.id === b.id && <Check className="w-3 h-3 text-black shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="h-px bg-gray-100 my-2 mx-2" />
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); setIsCreateModalOpen(true); }}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left transition-colors text-gray-500 hover:text-black"
                                    >
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Plus className="w-3 h-3" /></div>
                                        <span className="font-medium text-sm">{t("dashboard.sidebar.createNewPage")}</span>
                                    </button>
                                    <Link
                                        to={withLang("/dashboard/settings")}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left transition-colors text-gray-500 hover:text-black"
                                    >
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Settings className="w-3 h-3" /></div>
                                        <span className="font-medium text-sm">{t("dashboard.sidebar.settings", { defaultValue: "Settings" })}</span>
                                    </Link>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); logout(); }}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-left transition-colors text-gray-500 hover:text-red-600 mt-1"
                                    >
                                        <div className="w-6 h-6 rounded bg-gray-100 group-hover:bg-red-100 flex items-center justify-center text-gray-400"><LogOut className="w-3 h-3" /></div>
                                        <span className="font-medium text-sm">{t("dashboard.sidebar.logout")}</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <NotificationBell />
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {bio ? (
                        navGroups.map((group) => (
                            <div key={group.key} className="space-y-1">
                                <button
                                    onClick={() => toggleGroup(group.key)}
                                    className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-900 transition-colors py-2 px-3 group"
                                >
                                    <span>{group.label}</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openGroups[group.key] ? '' : '-rotate-90'}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {openGroups[group.key] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-1">
                                                {group.items.map((item) => {
                                                    // @ts-ignore
                                                    const isLocked = item.isProOnly ? userPlan !== 'pro' : (item.isPro && userPlan === 'free');
                                                    const isActiveItem = isActive(item.path);

                                                    return (
                                                        <Link
                                                            key={item.path}
                                                            to={withLang(item.path)}
                                                            // @ts-ignore
                                                            data-tour={item.tourId}
                                                            onClick={(e) => {
                                                                if (isLocked) {
                                                                    e.preventDefault();
                                                                    if (item.isProOnly) { setForcedPlan('pro'); } else { setForcedPlan(undefined); }
                                                                    setIsUpgradePopupOpen(true);
                                                                }
                                                                // Handle sidebar closing on mobile AND bio visit for onboarding
                                                                if (onClose) onClose();
                                                            }}
                                                            className={`
                                                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                                                ${isActiveItem
                                                                    ? "bg-[#C6F035]/20 text-black font-bold shadow-sm" // Light Lime bg for active
                                                                    : "text-gray-500 hover:bg-black/5 hover:text-black font-medium"
                                                                }
                                                            `}
                                                        >
                                                            <item.icon className={`w-4 h-4 shrink-0 stroke-[2px] ${isActiveItem ? "text-black" : "text-gray-400 group-hover:text-black"} transition-colors`} />
                                                            <span className="flex-1 text-sm">{item.name}</span>
                                                            {isLocked && <Lock className="w-3 h-3 text-gray-300" />}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-6 text-center">
                            <p className="text-sm text-gray-500 mb-4">{t("dashboard.sidebar.selectOrCreate")}</p>
                            <button
                                onClick={() => { canCreateBio ? setIsCreateModalOpen(true) : setIsUpgradePopupOpen(true); }}
                                className="bg-[#1A1A1A] text-white hover:bg-black w-full py-3 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {canCreateBio ? t("dashboard.sidebar.createPage") : t("dashboard.sidebar.unlockMorePages")}
                            </button>
                        </div>
                    )}
                </div>

                {/* Setup Widget (Checklist) */}
                {bio && !isSetupComplete && (
                    <div className="p-4 bg-[#F3F3F1] border-t border-[#E5E5E5] animate-in slide-in-from-bottom duration-500">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-display mb-1">{t("dashboard.sidebar.setup", { defaultValue: "SETUP" })}</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-black leading-tight">{t("dashboard.sidebar.checklist", { defaultValue: "Onboarding" })}</span>
                                    <span className="text-xs font-bold text-[#C6F035] bg-black px-2 py-0.5 rounded-full">{Math.round(progress)}%</span>
                                </div>
                            </div>

                            {/* Checklist Items */}
                            <div className="space-y-2">
                                <ChecklistItem label={t("dashboard.sidebar.steps.addLink", { defaultValue: "Add a link" })} isDone={onboardingState.hasLink} />
                                <ChecklistItem label={t("dashboard.sidebar.steps.explore", { defaultValue: "Explore modules" })} isDone={onboardingState.visitedPages} />
                                <ChecklistItem label={t("dashboard.sidebar.steps.settings", { defaultValue: "Configure settings" })} isDone={onboardingState.visitedSettings} />
                                <ChecklistItem label={t("dashboard.sidebar.steps.bio", { defaultValue: "Visit bio" })} isDone={onboardingState.visitedBio} />
                            </div>

                            {nextStep && (
                                <button
                                    onClick={nextStep.action}
                                    className="w-full py-3 bg-[#1A1A1A] hover:bg-black text-white hover:text-[#C6F035] rounded-xl text-xs font-bold transition-all hover:scale-[1.02] shadow-md flex items-center justify-center gap-2 mt-2 group"
                                >
                                    <span>{nextStep.label}</span>
                                    {nextStep.icon ? <nextStep.icon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /> : <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}

function ChecklistItem({ label, isDone }: { label: string; isDone: boolean }) {
    return (
        <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${isDone ? "text-gray-400 line-through" : "text-gray-700"}`}>
            {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#C6F035] fill-black shrink-0" />
            ) : (
                <Circle className="w-4 h-4 text-gray-300 shrink-0" />
            )}
            <span>{label}</span>
        </div>
    );
}

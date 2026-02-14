import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LayoutGrid, Settings, Globe, Bot, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router";

interface EditorNavProps {
    activeTab: "links" | "settings" | "customDomains";
    onChangeTab: (tab: "links" | "settings" | "customDomains") => void;
}

export function EditorNav({ activeTab, onChangeTab }: EditorNavProps) {
    const { t, i18n } = useTranslation("dashboard");
    const location = useLocation();
    const isPt = (i18n.resolvedLanguage || i18n.language || "en").startsWith("pt");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const tabs = [
        {
            id: "links" as const,
            label: t("editor.tabs.links"),
            shortLabel: t("editor.tabs.linksShort", "Links"),
            icon: LayoutGrid
        },
        {
            id: "settings" as const,
            label: t("editor.tabs.settings"),
            shortLabel: t("editor.tabs.settingsShort", "Ajustes"),
            icon: Settings,
            badge: "BETA"
        },
        {
            id: "customDomains" as const,
            label: t("nav.customDomains", { defaultValue: isPt ? "Domínios Personalizados" : "Custom Domains" }),
            shortLabel: isPt ? "Domínios" : "Domains",
            icon: Globe,
        },
    ];

    const navLinks = [
        {
            id: "design" as const,
            to: "/dashboard/design",
            label: t("nav.design", { defaultValue: isPt ? "Design" : "Design" }),
            shortLabel: "Design",
            icon: Palette,
        },
        {
            id: "automation" as const,
            to: "/dashboard/automation",
            label: t("nav.automation", { defaultValue: isPt ? "Automação" : "Automation" }),
            shortLabel: isPt ? "Automação" : "Auto",
            icon: Bot,
        },
    ];

    const itemBaseClass = `
        snap-start relative flex items-center justify-center gap-1.5
        px-2.5 sm:px-3 md:px-3 lg:px-3.5
        py-2 sm:py-2.5
        rounded-lg sm:rounded-full
        font-bold text-[11px] sm:text-xs
        transition-all duration-200 ease-out
        whitespace-nowrap flex-shrink-0
        min-w-[78px] sm:min-w-[92px]
        touch-manipulation
    `;

    const activeClass = 'bg-[#1A1A1A] text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)]';
    const inactiveClass = 'text-gray-500 hover:text-gray-900 hover:bg-black/5 active:bg-black/10';

    const scrollNav = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = Math.max(140, Math.round(el.clientWidth * 0.45));
        el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    };

    // Verificar se pode scrollar
    const checkScroll = () => {
        const el = scrollRef.current;
        if (el) {
            setCanScrollLeft(el.scrollLeft > 0);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", checkScroll);
            window.addEventListener("resize", checkScroll);
            return () => {
                el.removeEventListener("scroll", checkScroll);
                window.removeEventListener("resize", checkScroll);
            };
        }
    }, []);

    // Scroll para o botão ativo quando mudar
    useEffect(() => {
        const activeButton = scrollRef.current?.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
        if (activeButton && scrollRef.current) {
            const container = scrollRef.current;
            const containerRect = container.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();

            if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
                activeButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }
        }
    }, [activeTab]);

    return (
        <div className="relative w-full max-w-full">
            {/* Gradiente esquerdo - aparece quando pode scrollar */}
            {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            )}

            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => scrollNav("left")}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white border border-black/10 text-gray-700 shadow-sm hover:bg-gray-50"
                    aria-label={t("editor.tabs.scrollLeft", { defaultValue: "Scroll tabs left" })}
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Container principal com scroll */}
            <nav
                ref={scrollRef}
                className="flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md border border-black/10 rounded-full md:rounded-xl shadow-lg shadow-black/5 w-full max-w-full overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pl-2 pr-2 sm:pl-8 sm:pr-8"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            data-tab={tab.id}
                            onClick={() => onChangeTab(tab.id)}
                            className={`${itemBaseClass} ${isActive ? activeClass : inactiveClass}`}
                            title={tab.label}
                        >
                            <Icon
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isActive ? "text-[#C6F035]" : ""}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />

                            <span className="inline md:hidden max-w-[72px] truncate">
                                {tab.shortLabel}
                            </span>
                            <span className="hidden md:inline xl:hidden max-w-[80px] truncate">
                                {tab.shortLabel}
                            </span>
                            <span className="hidden xl:inline max-w-[140px] truncate">
                                {tab.label}
                            </span>

                            {/* Badge BETA */}
                            {tab.badge && (
                                <span className={`
                                    ml-0.5 text-[9px] sm:text-[10px] font-black px-1 sm:px-1.5 py-0.5 rounded 
                                    ${isActive
                                        ? 'bg-[#C6F035] text-black'
                                        : 'bg-amber-400 text-black'
                                    }
                                `}>
                                    {tab.badge}
                                </span>
                            )}

                            {/* Indicador de ativo (bolinha) - apenas em mobile */}
                            {isActive && (
                                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C6F035] rounded-full sm:hidden" />
                            )}
                        </button>
                    );
                })}
                <div className="w-px h-7 bg-black/10 mx-0.5 shrink-0" />

                {navLinks.map((navLink) => {
                    const Icon = navLink.icon;
                    const isActive = location.pathname.startsWith(navLink.to);

                    return (
                        <Link
                            key={navLink.id}
                            to={navLink.to}
                            className={`${itemBaseClass} ${isActive ? activeClass : inactiveClass}`}
                            title={navLink.label}
                        >
                            <Icon
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isActive ? "text-[#C6F035]" : ""}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />

                            <span className="inline md:hidden max-w-[72px] truncate">
                                {navLink.shortLabel}
                            </span>
                            <span className="hidden md:inline xl:hidden max-w-[82px] truncate">
                                {navLink.shortLabel}
                            </span>
                            <span className="hidden xl:inline max-w-[160px] truncate">
                                {navLink.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Gradiente direito - aparece quando pode scrollar */}
            {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            )}

            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => scrollNav("right")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white border border-black/10 text-gray-700 shadow-sm hover:bg-gray-50"
                    aria-label={t("editor.tabs.scrollRight", { defaultValue: "Scroll tabs right" })}
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

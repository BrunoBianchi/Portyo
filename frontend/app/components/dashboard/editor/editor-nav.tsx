import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LayoutGrid, Palette, Settings, Sparkles } from "lucide-react";

interface EditorNavProps {
    activeTab: "links" | "design" | "settings";
    onChangeTab: (tab: "links" | "design" | "settings") => void;
}

export function EditorNav({ activeTab, onChangeTab }: EditorNavProps) {
    const { t } = useTranslation("dashboard");
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
            id: "design" as const,
            label: t("editor.tabs.design"),
            shortLabel: t("editor.tabs.designShort", "Design"),
            icon: Palette
        },
        {
            id: "settings" as const,
            label: t("editor.tabs.settings"),
            shortLabel: t("editor.tabs.settingsShort", "Ajustes"),
            icon: Settings,
            badge: "BETA"
        },
    ];

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
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden" />
            )}

            {/* Container principal com scroll */}
            <nav
                ref={scrollRef}
                className="flex items-center gap-0.5 p-1 bg-white/90 backdrop-blur-md border border-black/10 rounded-xl shadow-lg shadow-black/5 w-full md:w-full lg:w-fit max-w-full overflow-x-auto scrollbar-hide scroll-smooth"
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
                            className={`
                                relative flex items-center justify-center gap-1 sm:gap-1.5 
                                px-2 sm:px-3 md:px-2 lg:px-4 
                                py-2 sm:py-2.5 
                                rounded-lg sm:rounded-full 
                                font-bold text-[11px] sm:text-xs 
                                transition-all duration-200 ease-out
                                whitespace-nowrap flex-shrink-0
                                min-w-[44px] sm:min-w-[auto]
                                touch-manipulation
                                ${isActive
                                    ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/20 transform scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-black/5 active:bg-black/10'
                                }
                            `}
                        >
                            <Icon
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isActive ? "text-[#C6F035]" : ""}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />

                            {/* Label - muda conforme o tamanho da tela */}
                            <span className="hidden sm:inline lg:hidden">
                                {tab.shortLabel}
                            </span>
                            <span className="hidden lg:inline">
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
            </nav>

            {/* Gradiente direito - aparece quando pode scrollar */}
            {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden" />
            )}
        </div>
    );
}

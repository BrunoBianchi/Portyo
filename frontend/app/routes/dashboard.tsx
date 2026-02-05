import AuthorizationGuard from "~/contexts/guard.context";
import { Sidebar } from "~/components/dashboard/sidebar";
import type { Route } from "../+types/root";
import { useEffect, useState, useMemo } from "react";
import { BioProvider } from "~/contexts/bio.context";
import { BlogProvider } from "~/contexts/blog.context";
import { SiteBlogProvider } from "~/contexts/site-blog.context";
import { AutoPostProvider } from "~/contexts/auto-post.context";
import { SiteAutoPostProvider } from "~/contexts/site-auto-post.context";
import { Outlet, useLocation } from "react-router";
import { MenuIcon } from "~/components/shared/icons";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";
import { NotificationBell } from "~/components/dashboard/notification-bell";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard | Portyo" },
        { name: "description", content: "Manage your links and profile" },
    ];
}

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const location = useLocation();
    const pathnameNoLang = location.pathname.replace(/^\/(en|pt)(?=\/|$)/, "");
    const isDashboardHome = pathnameNoLang === "/dashboard" || pathnameNoLang === "/dashboard/";

    const { startTour } = useDriverTour({
        primaryColor: tourPrimaryColor,
        storageKey: "portyo:dashboard-tour-done",
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, []);

    // Inicia o tour automaticamente na página inicial
    useEffect(() => {
        if (!isDashboardHome || isMobile) return;
        if (typeof window === "undefined") return;

        const hasSeenTour = window.localStorage.getItem("portyo:dashboard-tour-done");
        if (hasSeenTour) return;

        const timer = setTimeout(() => {
            startTour(steps);
        }, 1500);

        return () => clearTimeout(timer);
    }, [isDashboardHome, isMobile, startTour]);

    const steps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"dashboard-overview-header\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.welcomeTitle", "Bem-vindo ao Dashboard"),
                description: t("dashboard.tours.overview.steps.welcome"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-overview-stats\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.statsTitle", "Estatísticas"),
                description: t("dashboard.tours.overview.steps.stats"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-overview-sales\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.salesTitle", "Vendas"),
                description: t("dashboard.tours.overview.steps.sales"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-overview-activity\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.activityTitle", "Atividades"),
                description: t("dashboard.tours.overview.steps.activity"),
                side: "top",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-sidebar\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.sidebarTitle", "Navegação"),
                description: t("dashboard.tours.overview.steps.sidebar"),
                side: "right",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-nav-editor\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.navEditorTitle", "Editor"),
                description: t("dashboard.tours.overview.steps.navEditor"),
                side: "right",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-nav-forms\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.navFormsTitle", "Formulários"),
                description: t("dashboard.tours.overview.steps.navForms"),
                side: "right",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-nav-products\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.navProductsTitle", "Produtos"),
                description: t("dashboard.tours.overview.steps.navProducts"),
                side: "right",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-nav-integrations\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.navIntegrationsTitle", "Integrações"),
                description: t("dashboard.tours.overview.steps.navIntegrations"),
                side: "right",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"dashboard-nav-settings\"]",
            popover: {
                title: t("dashboard.tours.overview.steps.navSettingsTitle", "Configurações"),
                description: t("dashboard.tours.overview.steps.navSettings"),
                side: "top",
                align: "start",
            },
        },
    ], [t]);

    return (
        <AuthorizationGuard>
            <BioProvider>
                <BlogProvider>
                    <SiteBlogProvider>
                        <SiteAutoPostProvider>
                            <AutoPostProvider>
                                <div className="min-h-screen bg-surface-alt flex font-sans text-text-main">
                                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                                    <main className="flex-1 md:ml-64 transition-all duration-300 min-w-0">
                                        {/* Mobile Header */}
                                        <div className="md:hidden bg-surface/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between sticky top-0 z-40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
                                                    P
                                                </div>
                                                <span className="font-bold text-xl tracking-tight text-text-main">Portyo</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <NotificationBell />
                                                <button
                                                    className="p-2.5 bg-surface-alt rounded-xl text-text-main hover:bg-primary/20 transition-colors"
                                                    onClick={() => setIsSidebarOpen(true)}
                                                >
                                                    <MenuIcon />
                                                </button>
                                            </div>
                                        </div>

                                        <Outlet />
                                    </main>
                                </div>
                            </AutoPostProvider>
                        </SiteAutoPostProvider>
                    </SiteBlogProvider>
                </BlogProvider>
            </BioProvider>
        </AuthorizationGuard>
    )
}

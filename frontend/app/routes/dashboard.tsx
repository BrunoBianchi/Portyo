import AuthorizationGuard from "~/contexts/guard.context";
import { Sidebar } from "~/components/dashboard/sidebar";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { BioProvider } from "~/contexts/bio.context";
import { BlogProvider } from "~/contexts/blog.context";
import { SiteBlogProvider } from "~/contexts/site-blog.context";
import { Outlet, useLocation } from "react-router";
import { MenuIcon } from "~/components/shared/icons";
import Joyride, { type CallBackProps, EVENTS, STATUS, ACTIONS, type Step } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useJoyrideSettings } from "~/utils/joyride";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard | Portyo" },
        { name: "description", content: "Manage your links and profile" },
    ];
}

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { t } = useTranslation();
    const { isMobile, styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);
    const location = useLocation();
    const pathnameNoLang = location.pathname.replace(/^\/(en|pt)(?=\/|$)/, "");
    const isDashboardHome = pathnameNoLang === "/dashboard" || pathnameNoLang === "/dashboard/";

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!isDashboardHome) return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:dashboard-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isDashboardHome, isMobile]);

    const steps: Step[] = [
        {
            target: "[data-tour=\"dashboard-overview-header\"]",
            content: t("dashboard.tours.overview.steps.welcome"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"dashboard-overview-stats\"]",
            content: t("dashboard.tours.overview.steps.stats"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"dashboard-overview-sales\"]",
            content: t("dashboard.tours.overview.steps.sales"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"dashboard-overview-activity\"]",
            content: t("dashboard.tours.overview.steps.activity"),
            placement: "top",
        },
        {
            target: "[data-tour=\"dashboard-sidebar\"]",
            content: t("dashboard.tours.overview.steps.sidebar"),
            placement: "right",
        },
        {
            target: "[data-tour=\"dashboard-nav-editor\"]",
            content: t("dashboard.tours.overview.steps.navEditor"),
            placement: "right",
        },
        {
            target: "[data-tour=\"dashboard-nav-forms\"]",
            content: t("dashboard.tours.overview.steps.navForms"),
            placement: "right",
        },
        {
            target: "[data-tour=\"dashboard-nav-products\"]",
            content: t("dashboard.tours.overview.steps.navProducts"),
            placement: "right",
        },
        {
            target: "[data-tour=\"dashboard-nav-integrations\"]",
            content: t("dashboard.tours.overview.steps.navIntegrations"),
            placement: "right",
        },
        {
            target: "[data-tour=\"dashboard-nav-settings\"]",
            content: t("dashboard.tours.overview.steps.navSettings"),
            placement: "top",
        },
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            const delta = action === ACTIONS.PREV ? -1 : 1;
            setTourStepIndex(index + delta);
            return;
        }

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            setTourRun(false);
            setTourStepIndex(0);
            if (typeof window !== "undefined") {
                window.localStorage.setItem("portyo:dashboard-tour-done", "true");
            }
        }
    };

    return (
        <AuthorizationGuard>
            <BioProvider>
                <BlogProvider>
                    <SiteBlogProvider>
                        <Joyride
                            steps={steps}
                            run={tourRun && !isMobile && isDashboardHome}
                            stepIndex={tourStepIndex}
                            continuous
                            showSkipButton
                            spotlightClicks
                            scrollToFirstStep
                            callback={handleJoyrideCallback}
                            styles={joyrideStyles}
                            scrollOffset={joyrideProps.scrollOffset}
                            spotlightPadding={joyrideProps.spotlightPadding}
                            disableScrollParentFix={joyrideProps.disableScrollParentFix}
                        />
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
                                    <button
                                        className="p-2.5 bg-surface-alt rounded-xl text-text-main hover:bg-primary/20 transition-colors"
                                        onClick={() => setIsSidebarOpen(true)}
                                    >
                                        <MenuIcon />
                                    </button>
                                </div>

                                <Outlet />
                            </main>
                        </div>
                    </SiteBlogProvider>
                </BlogProvider>
            </BioProvider>
        </AuthorizationGuard>
    )
}

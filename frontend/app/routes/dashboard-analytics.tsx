import { useContext, useState, useEffect } from "react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import type { Route } from "../+types/root";
import {
    Save,
    Lock,
    BarChart3,
    Facebook,
    Sparkles,
    Settings,
    X,
    ExternalLink,
    Globe
} from "lucide-react";
import { api } from "~/services/api";
import { Link } from "react-router";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { InfoTooltip } from "~/components/shared/info-tooltip";
import { useTranslation } from "react-i18next";
import { useJoyrideSettings } from "~/utils/joyride";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Analytics Settings | Portyo" },
        { name: "description", content: "Manage your page analytics settings" },
    ];
}

export default function DashboardAnalytics() {
    const { bio, updateBio } = useContext(BioContext);
    const { t } = useTranslation();
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
    const [facebookPixelId, setFacebookPixelId] = useState("");
    const [noIndex, setNoIndex] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [showGAPopup, setShowGAPopup] = useState(false);
    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { isMobile, styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);

    useEffect(() => {
        if (bio) {
            setGoogleAnalyticsId(bio.googleAnalyticsId || "");
            setFacebookPixelId(bio.facebookPixelId || "");
            setNoIndex(bio.noIndex || false);

            // Check if connected to GA and fetch data
            checkGAConnection();
        }
    }, [bio]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:analytics-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    const analyticsTourSteps: Step[] = [
        {
            target: "[data-tour=\"analytics-header\"]",
            content: t("dashboard.tours.analytics.steps.header"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"analytics-save\"]",
            content: t("dashboard.tours.analytics.steps.save"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"analytics-overview\"]",
            content: t("dashboard.tours.analytics.steps.overview"),
            placement: "top",
        },
        {
            target: "[data-tour=\"analytics-codes\"]",
            content: t("dashboard.tours.analytics.steps.codes"),
            placement: "top",
        },
        {
            target: "[data-tour=\"analytics-indexing\"]",
            content: t("dashboard.tours.analytics.steps.indexing"),
            placement: "top",
        },
    ];

    const handleAnalyticsTourCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
            const delta = action === ACTIONS.PREV ? -1 : 1;
            setTourStepIndex(index + delta);
            return;
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setTourRun(false);
            setTourStepIndex(0);
            if (typeof window !== "undefined") {
                window.localStorage.setItem("portyo:analytics-tour-done", "true");
            }
        }
    };

    const checkGAConnection = async () => {
        if (!bio) return;
        try {
            // We can check if we have data by trying to fetch it
            // Or check integrations endpoint. Let's try fetching data directly.
            setIsLoadingData(true);
            const res = await api.get(`/google-analytics/data?bioId=${bio.id}`);
            if (res.data) {
                setAnalyticsData(res.data);
            }
        } catch (error: any) {
            // Check if it's the "not connected" error
            if (error.response?.status === 404 && error.response?.data?.connected === false) {
                setShowGAPopup(true);
            }

        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSave = async () => {
        if (!bio) return;
        setIsSaving(true);
        try {
            await updateBio(bio.id, {
                googleAnalyticsId,
                facebookPixelId,
                noIndex
            });
        } catch (error) {
            console.error("Failed to save Analytics settings", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AuthorizationGuard minPlan="standard" fallback={
            <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-primary/10 animate-pulse">
                    <Sparkles className="w-10 h-10 text-primary-hover" />
                </div>
                <h1 className="text-3xl font-bold text-text-main mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.locked.title")}</h1>
                <p className="text-text-muted mb-8 max-w-md mx-auto text-base">{t("dashboard.analytics.locked.subtitle")}</p>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1">
                    {t("dashboard.analytics.locked.cta")}
                </button>
            </div>
        }>
            {/* Google Analytics Not Connected Popup */}
            {showGAPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowGAPopup(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.gaPopup.title")}</h3>
                                <p className="text-sm text-muted-foreground">{t("dashboard.analytics.gaPopup.subtitle")}</p>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">{t("dashboard.analytics.gaPopup.body")}</p>

                        <div className="flex gap-3">
                            <Link
                                to="/dashboard/integrations"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                {t("dashboard.analytics.gaPopup.cta")}
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setShowGAPopup(false)}
                                className="px-4 py-3 bg-muted text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                {t("dashboard.analytics.gaPopup.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 md:p-6 max-w-5xl mx-auto pb-12">
                <Joyride
                    steps={analyticsTourSteps}
                    run={tourRun && !isMobile}
                    stepIndex={tourStepIndex}
                    continuous
                    showSkipButton
                    spotlightClicks
                    scrollToFirstStep
                    callback={handleAnalyticsTourCallback}
                    scrollOffset={joyrideProps.scrollOffset}
                    spotlightPadding={joyrideProps.spotlightPadding}
                    disableScrollParentFix={joyrideProps.disableScrollParentFix}
                    locale={{
                        back: t("dashboard.tours.common.back"),
                        close: t("dashboard.tours.common.close"),
                        last: t("dashboard.tours.common.last"),
                        next: t("dashboard.tours.common.next"),
                        skip: t("dashboard.tours.common.skip"),
                    }}
                    styles={joyrideStyles}
                />
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4" data-tour="analytics-header">
                    <div>
                        <h1 className="text-2xl font-bold text-text-main tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.title")}</h1>
                        <p className="text-text-muted text-sm">{t("dashboard.analytics.subtitle")}</p>
                    </div>
                    <button
                        data-tour="analytics-save"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? t("dashboard.analytics.saving") : t("dashboard.analytics.save")}
                    </button>
                </header>

                <div className="space-y-6">

                    <section className="bg-surface-card p-6 rounded-xl shadow-sm border border-border space-y-6" data-tour="analytics-codes">
                        <div className="flex items-center gap-4 border-b border-border pb-4">
                            <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.advanced.title")}</h2>
                                <p className="text-text-muted text-sm">{t("dashboard.analytics.advanced.subtitle")}</p>
                            </div>
                        </div>

                        {analyticsData && (
                            <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-100" data-tour="analytics-overview">
                                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    {t("dashboard.analytics.overview.title")}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-surface-card p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">{t("dashboard.analytics.overview.activeUsers")}</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {(analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[0].value), 0)}
                                        </p>
                                    </div>
                                    <div className="bg-surface-card p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">{t("dashboard.analytics.overview.pageViews")}</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {(analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[1].value), 0)}
                                        </p>
                                    </div>
                                    <div className="bg-surface-card p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">{t("dashboard.analytics.overview.totalTime")}</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {(() => {
                                                const seconds = (analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[2].value), 0);
                                                const h = Math.floor(seconds / 3600);
                                                const m = Math.floor((seconds % 3600) / 60);
                                                return h > 0 ? t("dashboard.analytics.overview.timeHm", { hours: h, minutes: m }) : t("dashboard.analytics.overview.timeM", { minutes: m });
                                            })()}
                                        </p>
                                    </div>
                                    <div className="bg-surface-card p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-muted-foreground mb-1">{t("dashboard.analytics.overview.interactions")}</p>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-foreground">
                                                {t("dashboard.analytics.overview.scrolls")}: <span className="font-normal">{(analyticsData.events?.rows || []).find((r: any) => r.dimensionValues[0].value === 'scroll')?.metricValues[0].value || 0}</span>
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {t("dashboard.analytics.overview.clicks")}: <span className="font-normal">{(analyticsData.events?.rows || []).find((r: any) => r.dimensionValues[0].value === 'click')?.metricValues[0].value || 0}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-400 mt-3 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {t("dashboard.analytics.overview.note")}
                                </p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <BarChart3 className="w-3 h-3" />
                                    {t("dashboard.analytics.googleAnalyticsId")}
                                    <InfoTooltip content={t("tooltips.analytics.googleAnalyticsId")} position="top" />
                                </label>
                                <input
                                    type="text"
                                    value={googleAnalyticsId}
                                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    placeholder={t("dashboard.analytics.googleAnalyticsPlaceholder")}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <Facebook className="w-3 h-3" />
                                    {t("dashboard.analytics.facebookPixelId")}
                                    <InfoTooltip content={t("tooltips.analytics.facebookPixelId")} position="top" />
                                </label>
                                <input
                                    type="text"
                                    value={facebookPixelId}
                                    onChange={(e) => setFacebookPixelId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    placeholder={t("dashboard.analytics.facebookPixelPlaceholder")}
                                />
                            </div>

                            <div className="md:col-span-2" data-tour="analytics-indexing">
                                <label className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-alt cursor-pointer hover:bg-surface-muted transition-colors group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={noIndex}
                                            onChange={(e) => setNoIndex(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <span className="block font-bold text-text-main text-sm flex items-center gap-2">
                                                <Lock className="w-3 h-3" />
                                                {t("dashboard.analytics.noIndex.title")}
                                                <InfoTooltip content={t("tooltips.analytics.noIndex")} position="top" />
                                            </span>
                                            <span className="block text-xs text-text-muted mt-0.5">{t("dashboard.analytics.noIndex.subtitle")}</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthorizationGuard>
    );
}
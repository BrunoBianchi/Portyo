import { useContext, useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { api } from "~/services/api";
import { Link } from "react-router";
import { InfoTooltip } from "~/components/shared/info-tooltip";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Analytics Settings | Portyo" },
        { name: "description", content: "Manage your page analytics settings" },
    ];
}

export default function DashboardAnalytics() {
    const { bio, updateBio } = useContext(BioContext);
    const { t } = useTranslation("dashboard");
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
    const [facebookPixelId, setFacebookPixelId] = useState("");
    const [noIndex, setNoIndex] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [showGAPopup, setShowGAPopup] = useState(false);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();

    const { startTour } = useDriverTour({
        primaryColor: tourPrimaryColor,
        storageKey: "portyo:analytics-tour-done",
    });

    useEffect(() => {
        if (bio) {
            setGoogleAnalyticsId(bio.googleAnalyticsId || "");
            setFacebookPixelId(bio.facebookPixelId || "");
            setNoIndex(bio.noIndex || false);
            checkGAConnection();
        }
    }, [bio]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, []);

    // Inicia o tour automaticamente
    useEffect(() => {
        if (isMobile) return;
        if (typeof window === "undefined") return;

        const hasSeenTour = window.localStorage.getItem("portyo:analytics-tour-done");
        if (hasSeenTour) return;

        const timer = setTimeout(() => {
            startTour(analyticsTourSteps);
        }, 1500);

        return () => clearTimeout(timer);
    }, [isMobile, startTour]);

    const analyticsTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"analytics-header\"]",
            popover: {
                title: t("dashboard.tours.analytics.steps.headerTitle", "Analytics"),
                description: t("dashboard.tours.analytics.steps.header"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"analytics-save\"]",
            popover: {
                title: t("dashboard.tours.analytics.steps.saveTitle", "Salvar"),
                description: t("dashboard.tours.analytics.steps.save"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"analytics-overview\"]",
            popover: {
                title: t("dashboard.tours.analytics.steps.overviewTitle", "Visão Geral"),
                description: t("dashboard.tours.analytics.steps.overview"),
                side: "top",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"analytics-codes\"]",
            popover: {
                title: t("dashboard.tours.analytics.steps.codesTitle", "Códigos de Rastreamento"),
                description: t("dashboard.tours.analytics.steps.codes"),
                side: "top",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"analytics-indexing\"]",
            popover: {
                title: t("dashboard.tours.analytics.steps.indexingTitle", "Indexação"),
                description: t("dashboard.tours.analytics.steps.indexing"),
                side: "top",
                align: "start",
            },
        },
    ], [t]);

    const checkGAConnection = async () => {
        if (!bio) return;
        try {
            setIsLoadingData(true);
            const res = await api.get(`/google-analytics/data?bioId=${bio.id}`);
            if (res.data) {
                setAnalyticsData(res.data);
            }
        } catch (error: any) {
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
                <div className="w-20 h-20 bg-[#C6F035] rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-black text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.locked.title")}</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-base font-medium">{t("dashboard.analytics.locked.subtitle")}</p>
                <button className="px-8 py-3 bg-[#C6F035] text-black rounded-[14px] font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                    {t("dashboard.analytics.locked.cta")}
                </button>
            </div>
        }>
            {/* Google Analytics Not Connected Popup */}
            {showGAPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGAPopup(false)} />
                    <div className="relative bg-white rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black p-8 max-w-md w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowGAPopup(false)}
                            className="absolute top-4 right-4 p-2.5 hover:bg-black hover:text-white rounded-full transition-colors border-2 border-transparent hover:border-black"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-[#E0EAFF] rounded-2xl border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <BarChart3 className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.gaPopup.title")}</h3>
                                <p className="text-sm text-gray-500 font-bold">{t("dashboard.analytics.gaPopup.subtitle")}</p>
                            </div>
                        </div>

                        <p className="text-gray-600 font-medium mb-8 leading-relaxed">{t("dashboard.analytics.gaPopup.body")}</p>

                        <div className="flex gap-4">
                            <Link
                                to="/dashboard/integrations"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0047FF] text-white rounded-xl font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                {t("dashboard.analytics.gaPopup.cta")}
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setShowGAPopup(false)}
                                className="px-6 py-3 bg-[#F3F3F1] text-gray-500 rounded-xl font-bold border-2 border-black hover:bg-white transition-all"
                            >
                                {t("dashboard.analytics.gaPopup.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6" data-tour="analytics-header">
                    <div>
                        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.title")}</h1>
                        <p className="text-gray-600 text-lg font-medium">{t("dashboard.analytics.subtitle")}</p>
                    </div>
                    <button
                        data-tour="analytics-save"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-[#C6F035] text-black rounded-[16px] font-black text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? t("dashboard.analytics.saving") : t("dashboard.analytics.save")}
                    </button>
                </header>

                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black space-y-8" data-tour="analytics-codes">
                        <div className="flex items-center gap-4 border-b-4 border-black/5 pb-6">
                            <div className="p-3 bg-[#E0EAFF] text-blue-600 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.analytics.advanced.title")}</h2>
                                <p className="text-gray-500 font-bold">{t("dashboard.analytics.advanced.subtitle")}</p>
                            </div>
                        </div>

                        {analyticsData && (
                            <div className="mb-8 p-6 bg-[#E0EAFF] rounded-[24px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" data-tour="analytics-overview">
                                <h3 className="text-xl font-black text-[#0047FF] mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6" strokeWidth={3} />
                                    {t("dashboard.analytics.overview.title")}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-white p-5 rounded-[20px] shadow-sm border-2 border-black">
                                        <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">{t("dashboard.analytics.overview.activeUsers")}</p>
                                        <p className="text-3xl font-black text-[#1A1A1A]">
                                            {(analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[0].value), 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-5 rounded-[20px] shadow-sm border-2 border-black">
                                        <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">{t("dashboard.analytics.overview.pageViews")}</p>
                                        <p className="text-3xl font-black text-[#1A1A1A]">
                                            {(analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[1].value), 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-5 rounded-[20px] shadow-sm border-2 border-black">
                                        <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">{t("dashboard.analytics.overview.totalTime")}</p>
                                        <p className="text-3xl font-black text-[#1A1A1A]">
                                            {(() => {
                                                const seconds = (analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[2].value), 0);
                                                const h = Math.floor(seconds / 3600);
                                                const m = Math.floor((seconds % 3600) / 60);
                                                return h > 0 ? t("dashboard.analytics.overview.timeHm", { hours: h, minutes: m }) : t("dashboard.analytics.overview.timeM", { minutes: m });
                                            })()}
                                        </p>
                                    </div>
                                    <div className="bg-white p-5 rounded-[20px] shadow-sm border-2 border-black">
                                        <p className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">{t("dashboard.analytics.overview.interactions")}</p>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-sm font-black text-[#1A1A1A] flex justify-between">
                                                {t("dashboard.analytics.overview.scrolls")}
                                                <span className="font-medium bg-gray-100 px-2 rounded-md">{(analyticsData.events?.rows || []).find((r: any) => r.dimensionValues[0].value === 'scroll')?.metricValues[0].value || 0}</span>
                                            </span>
                                            <span className="text-sm font-black text-[#1A1A1A] flex justify-between">
                                                {t("dashboard.analytics.overview.clicks")}
                                                <span className="font-medium bg-gray-100 px-2 rounded-md">{(analyticsData.events?.rows || []).find((r: any) => r.dimensionValues[0].value === 'click')?.metricValues[0].value || 0}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-[#0047FF] mt-4 flex items-center gap-1.5 opacity-80">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {t("dashboard.analytics.overview.note")}
                                </p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-black text-[#1A1A1A] mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <div className="p-1 bg-[#F3F3F1] border border-black rounded-md">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                    </div>
                                    {t("dashboard.analytics.googleAnalyticsId")}
                                    <InfoTooltip content={t("tooltips.analytics.googleAnalyticsId")} position="top" />
                                </label>
                                <input
                                    type="text"
                                    value={googleAnalyticsId}
                                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                    className="w-full px-5 py-4 rounded-[16px] border-2 border-black bg-[#F3F3F1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/10 transition-all font-medium placeholder:text-gray-400"
                                    placeholder={t("dashboard.analytics.googleAnalyticsPlaceholder")}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-[#1A1A1A] mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <div className="p-1 bg-[#F3F3F1] border border-black rounded-md">
                                        <Facebook className="w-3.5 h-3.5" />
                                    </div>
                                    {t("dashboard.analytics.facebookPixelId")}
                                    <InfoTooltip content={t("tooltips.analytics.facebookPixelId")} position="top" />
                                </label>
                                <input
                                    type="text"
                                    value={facebookPixelId}
                                    onChange={(e) => setFacebookPixelId(e.target.value)}
                                    className="w-full px-5 py-4 rounded-[16px] border-2 border-black bg-[#F3F3F1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/10 transition-all font-medium placeholder:text-gray-400"
                                    placeholder={t("dashboard.analytics.facebookPixelPlaceholder")}
                                />
                            </div>

                            <div className="md:col-span-2" data-tour="analytics-indexing">
                                <label className="flex items-center gap-5 p-6 rounded-[24px] border-2 border-black bg-[#F3F3F1] hover:bg-white cursor-pointer transition-all group shadow-sm hover:shadow-md">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={noIndex}
                                            onChange={(e) => setNoIndex(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#C6F035] peer-checked:border-black border-2 border-gray-400 peer-checked:border-2"></div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <span className="block font-black text-[#1A1A1A] text-lg flex items-center gap-2 mb-1">
                                                <Lock className="w-4 h-4" />
                                                {t("dashboard.analytics.noIndex.title")}
                                                <InfoTooltip content={t("tooltips.analytics.noIndex")} position="top" />
                                            </span>
                                            <span className="block text-sm text-gray-500 font-medium">{t("dashboard.analytics.noIndex.subtitle")}</span>
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

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
    ExternalLink
} from "lucide-react";
import { api } from "~/services/api";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Analytics Settings | Portyo" },
        { name: "description", content: "Manage your page analytics settings" },
    ];
}

export default function DashboardAnalytics() {
    const { bio, updateBio } = useContext(BioContext);
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
    const [facebookPixelId, setFacebookPixelId] = useState("");
    const [noIndex, setNoIndex] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [showGAPopup, setShowGAPopup] = useState(false);

    useEffect(() => {
        if (bio) {
            setGoogleAnalyticsId(bio.googleAnalyticsId || "");
            setFacebookPixelId(bio.facebookPixelId || "");
            setNoIndex(bio.noIndex || false);

            // Check if connected to GA and fetch data
            checkGAConnection();
        }
    }, [bio]);

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
            console.log("GA Data fetch failed (likely not connected)", error);
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
                <h1 className="text-3xl font-extrabold text-text-main mb-3 tracking-tight">Upgrade to Pro</h1>
                <p className="text-text-muted mb-8 max-w-md mx-auto text-base">Analytics settings are available for Standard and Pro plans. Upgrade now to track your page performance.</p>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1">
                    Upgrade Plan
                </button>
            </div>
        }>
            {/* Google Analytics Not Connected Popup */}
            {showGAPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowGAPopup(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Google Analytics Not Connected</h3>
                                <p className="text-sm text-gray-500">Connect to see your data</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            To view Google Analytics data, you need to connect your Google Analytics account first in the Integrations page.
                        </p>

                        <div className="flex gap-3">
                            <Link
                                to="/dashboard/integrations"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                Go to Integrations
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setShowGAPopup(false)}
                                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 md:p-6 max-w-5xl mx-auto pb-12">
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-text-main tracking-tight mb-1">Analytics Settings</h1>
                        <p className="text-text-muted text-sm">Tracking codes and other advanced configurations.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </header>

                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
                        <div className="flex items-center gap-4 border-b border-border pb-4">
                            <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main tracking-tight">Advanced Settings</h2>
                                <p className="text-text-muted text-sm">Tracking codes and other advanced configurations.</p>
                            </div>
                        </div>

                        {analyticsData && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Google Analytics Overview (Last 30 Days)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-gray-500 mb-1">Active Users</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[0].value), 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-gray-500 mb-1">Page Views</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[1].value), 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-gray-500 mb-1">Total Time</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(() => {
                                                const seconds = (analyticsData.overview?.rows || []).reduce((acc: number, row: any) => acc + parseInt(row.metricValues[2].value), 0);
                                                const h = Math.floor(seconds / 3600);
                                                const m = Math.floor((seconds % 3600) / 60);
                                                return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                            })()}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-gray-500 mb-1">Interactions</p>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-gray-900">
                                                Scrolls: <span className="font-normal">{(analyticsData.events?.rows || []).find((r: any) => r.dimensionValues[0].value === 'scroll')?.metricValues[0].value || 0}</span>
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">
                                                Clicks: <span className="font-normal">{(analyticsData.events?.rows || []).find((r: any) => r.dimensionValues[0].value === 'click')?.metricValues[0].value || 0}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Note: Data may take 24-48 hours to appear. If you use an AdBlocker, your own visits may not be counted.
                                </p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <BarChart3 className="w-3 h-3" />
                                    Google Analytics ID
                                </label>
                                <input
                                    type="text"
                                    value={googleAnalyticsId}
                                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    placeholder="G-XXXXXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <Facebook className="w-3 h-3" />
                                    Facebook Pixel ID
                                </label>
                                <input
                                    type="text"
                                    value={facebookPixelId}
                                    onChange={(e) => setFacebookPixelId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    placeholder="123456789012345"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-alt cursor-pointer hover:bg-surface-muted transition-colors group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={noIndex}
                                            onChange={(e) => setNoIndex(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-text-main text-sm flex items-center gap-2">
                                            <Lock className="w-3 h-3" />
                                            Discourage search engines from indexing this site
                                        </span>
                                        <span className="block text-xs text-text-muted mt-0.5">Enable this if you want your page to be private.</span>
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
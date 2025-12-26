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
    Settings
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
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

    useEffect(() => {
        if (bio) {
            setGoogleAnalyticsId(bio.googleAnalyticsId || "");
            setFacebookPixelId(bio.facebookPixelId || "");
            setNoIndex(bio.noIndex || false);
        }
    }, [bio]);

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
        <AuthorizationGuard minPlan="free" fallback={
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
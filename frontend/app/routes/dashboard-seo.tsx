import { useContext, useState, useEffect } from "react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import type { Route } from "../+types/root";
import { 
    Search, 
    Share2, 
    Settings, 
    Save, 
    Image as ImageIcon, 
    Globe, 
    Sparkles
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SEO Settings | Portyo" },
    { name: "description", content: "Manage your page SEO settings" },
  ];
}

export default function DashboardSeo() {
    const { bio, updateBio } = useContext(BioContext);
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [favicon, setFavicon] = useState("");
    const [seoKeywords, setSeoKeywords] = useState("");
    const [ogTitle, setOgTitle] = useState("");
    const [ogDescription, setOgDescription] = useState("");
    const [ogImage, setOgImage] = useState("");
    const [customDomain, setCustomDomain] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (bio) {
            setSeoTitle(bio.seoTitle || "");
            setSeoDescription(bio.seoDescription || "");
            setFavicon(bio.favicon || "");
            setSeoKeywords(bio.seoKeywords || "");
            setOgTitle(bio.ogTitle || "");
            setOgDescription(bio.ogDescription || "");
            setOgImage(bio.ogImage || "");
            setCustomDomain(bio.customDomain || "");
        }
    }, [bio]);

    const handleSave = async () => {
        if (!bio) return;
        setIsSaving(true);
        try {
            await updateBio(bio.id, {
                seoTitle,
                seoDescription,
                favicon,
                seoKeywords,
                ogTitle,
                ogDescription,
                ogImage,
                customDomain
            });
        } catch (error) {
            console.error("Failed to save SEO settings", error);
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
                <p className="text-text-muted mb-8 max-w-md mx-auto text-base">SEO settings are available for Standard and Pro plans. Upgrade now to customize your page title, description, and favicon.</p>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1">
                    Upgrade Plan
                </button>
            </div>
        }>
            <div className="p-4 md:p-6 max-w-5xl mx-auto pb-12">
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-text-main tracking-tight mb-1">SEO Settings</h1>
                        <p className="text-text-muted text-sm">Customize how your page appears in search results and social media.</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </header>

                <div className="space-y-6">
                    {/* Basic SEO */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
                        <div className="flex items-center gap-4 border-b border-border pb-4">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                <Search className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main tracking-tight">Search Engine Optimization</h2>
                                <p className="text-text-muted text-sm">Control how your page looks on Google and other search engines.</p>
                            </div>
                        </div>
                        
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Page Title</label>
                                <input 
                                    type="text" 
                                    value={seoTitle}
                                    onChange={(e) => setSeoTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    placeholder="e.g. John Doe - Digital Creator"
                                />
                                <p className="mt-2 text-xs text-text-muted font-medium flex items-center gap-1">
                                    <span className={seoTitle.length > 60 ? "text-red-500" : "text-green-500"}>{seoTitle.length}</span> / 60 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Meta Description</label>
                                <textarea 
                                    value={seoDescription}
                                    onChange={(e) => setSeoDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-sm"
                                    placeholder="A brief description of your page..."
                                />
                                <p className="mt-2 text-xs text-text-muted font-medium flex items-center gap-1">
                                    <span className={seoDescription.length > 160 ? "text-red-500" : "text-green-500"}>{seoDescription.length}</span> / 160 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Keywords</label>
                                <input 
                                    type="text" 
                                    value={seoKeywords}
                                    onChange={(e) => setSeoKeywords(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    placeholder="portfolio, links, creator, design (comma separated)"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Social Media */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
                        <div className="flex items-center gap-4 border-b border-border pb-4">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main tracking-tight">Social Media Sharing</h2>
                                <p className="text-text-muted text-sm">Customize how your link looks when shared on social media.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Social Title</label>
                                    <input 
                                        type="text" 
                                        value={ogTitle}
                                        onChange={(e) => setOgTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                        placeholder="Same as page title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Social Description</label>
                                    <textarea 
                                        value={ogDescription}
                                        onChange={(e) => setOgDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-sm"
                                        placeholder="Same as meta description"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Social Image URL</label>
                                <div className="space-y-4">
                                    <input 
                                        type="text" 
                                        value={ogImage}
                                        onChange={(e) => setOgImage(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <div className="aspect-video rounded-xl bg-surface-alt border border-border border-dashed flex items-center justify-center overflow-hidden relative group transition-all hover:border-primary/50">
                                        {ogImage ? (
                                            <img src={ogImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        ) : (
                                            <div className="text-center p-6">
                                                <ImageIcon className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
                                                <p className="text-xs text-text-muted font-medium">Preview will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthorizationGuard>
    );
}

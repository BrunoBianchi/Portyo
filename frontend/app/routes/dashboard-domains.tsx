import { useContext, useState, useEffect } from "react";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import type { Route } from "../+types/root";
import {
    Globe,
    Save,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    ExternalLink
} from "lucide-react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Custom Domain | Portyo" },
        { name: "description", content: "Connect your own domain to your Portyo page" },
    ];
}

export default function DashboardDomains() {
    const { bio, updateBio } = useContext(BioContext);
    const [customDomain, setCustomDomain] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [originalDomain, setOriginalDomain] = useState("");

    useEffect(() => {
        if (bio) {
            setCustomDomain(bio.customDomain || "");
            setOriginalDomain(bio.customDomain || "");
        }
    }, [bio]);

    const handleSave = async () => {
        if (!bio) return;
        setIsSaving(true);
        try {
            await updateBio(bio.id, {
                customDomain: customDomain.trim() || null
            });
            setOriginalDomain(customDomain.trim());
        } catch (error) {
            console.error("Failed to save custom domain", error);
        } finally {
            setIsSaving(false);
        }
    };

    const isDirty = customDomain !== originalDomain;

    return (
        <AuthorizationGuard minPlan="standard" fallback={
            <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-primary/10 animate-pulse">
                    <Sparkles className="w-10 h-10 text-primary-hover" />
                </div>
                <h1 className="text-3xl font-extrabold text-text-main mb-3 tracking-tight">Upgrade to Standard</h1>
                <p className="text-text-muted mb-8 max-w-md mx-auto text-base">Custom domains are available on Standard and Pro plans. Upgrade now to connect your own domain (e.g., yourname.com) to your page.</p>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1">
                    Upgrade Plan
                </button>
            </div>
        }>
            <div className="p-4 md:p-6 max-w-5xl mx-auto pb-12">
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-text-main tracking-tight mb-1">Custom Domain</h1>
                        <p className="text-text-muted text-sm">Connect your own domain name to your Portyo page.</p>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* Domain Configuration */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-border space-y-6">
                        <div className="flex items-center gap-4 border-b border-border pb-4">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main tracking-tight">Domain Configuration</h2>
                                <p className="text-text-muted text-sm">Enter the domain you want to use for your page.</p>
                            </div>
                        </div>

                        <div className="grid gap-6 max-w-2xl">
                            <div>
                                <label className="block text-xs font-bold text-text-main mb-2 uppercase tracking-wider">Your Domain</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customDomain}
                                        onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                                        className="w-full pl-4 pr-32 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
                                        placeholder="e.g. portfolio.com"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving || !isDirty}
                                            className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-text-muted flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Enter your domain without http:// or https://
                                </p>
                            </div>

                            {/* DNS Instructions */}
                            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    DNS Configuration Required
                                </h3>
                                <div className="space-y-3 text-sm text-blue-800/80">
                                    <p>To make your domain work, you need to add a DNS record to your domain provider (like GoDaddy, Namecheap, or Cloudflare).</p>

                                    <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                            <div>
                                                <span className="block font-bold text-blue-900 uppercase tracking-wider mb-1">Type</span>
                                                <span className="font-mono bg-blue-50 px-2 py-1 rounded">CNAME</span>
                                            </div>
                                            <div>
                                                <span className="block font-bold text-blue-900 uppercase tracking-wider mb-1">Name / Host</span>
                                                <span className="font-mono bg-blue-50 px-2 py-1 rounded">@</span>
                                            </div>
                                            <div>
                                                <span className="block font-bold text-blue-900 uppercase tracking-wider mb-1">Value / Target</span>
                                                <span className="font-mono bg-blue-50 px-2 py-1 rounded">portyo.me</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs">
                                        Note: DNS changes can take up to 48 hours to propagate globally, though it usually happens within a few minutes.
                                    </p>
                                </div>
                            </div>

                            {/* Verification Status - Simple placeholder for now */}
                            {originalDomain && (
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-green-900 text-sm">Domain Linked</h4>
                                        <p className="text-xs text-green-700 mt-1">
                                            Your bio is configured to use <strong>{originalDomain}</strong>.
                                            If you've set up your DNS correctly, your page should be accessible soon.
                                        </p>
                                        <a
                                            href={`https://${originalDomain}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-bold text-green-800 mt-2 hover:underline"
                                        >
                                            Visit {originalDomain} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AuthorizationGuard>
    );
}

import { useContext, useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { createShortLink, deleteShortLink, getShortLinks, type ShortLink } from "~/services/short-link.service";
import { toast } from "react-hot-toast";
import { Copy, Link as LinkIcon, Loader2, Plus, Trash2 } from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Link shortener | Portyo" },
        { name: "description", content: "Create short links for your bio and custom domain." },
    ];
};

const normalizeSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

export default function DashboardLinkShortener() {
    const { bio } = useContext(BioContext);
    const [links, setLinks] = useState<ShortLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: "",
        slug: "",
        destinationUrl: "",
    });

    const bioBaseUrl = useMemo(() => {
        if (!bio?.sufix) return "";
        return `https://portyo.me/p/${bio.sufix}`;
    }, [bio?.sufix]);

    const customDomainBaseUrl = useMemo(() => {
        if (!bio?.customDomain) return "";
        return `https://${bio.customDomain}`;
    }, [bio?.customDomain]);

    const loadLinks = async () => {
        if (!bio?.id) return;
        setLoading(true);
        try {
            const data = await getShortLinks(bio.id);
            setLinks(data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to load short links.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLinks();
    }, [bio?.id]);

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!bio?.id) return;

        const slug = normalizeSlug(form.slug || form.title);
        if (!slug) {
            toast.error("Provide a valid title or slug.");
            return;
        }

        setSaving(true);
        try {
            const created = await createShortLink({
                bioId: bio.id,
                title: form.title.trim(),
                slug,
                destinationUrl: form.destinationUrl.trim(),
            });

            setLinks((prev) => [created, ...prev]);
            setForm({ title: "", slug: "", destinationUrl: "" });
            toast.success("Short URL created.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create short URL.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteShortLink(id);
            setLinks((prev) => prev.filter((item) => item.id !== id));
            toast.success("Short URL removed.");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to remove short URL.");
        }
    };

    const copy = async (value: string) => {
        await navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard.");
    };

    return (
        <AuthorizationGuard>
            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
                <header>
                    <h1 className="text-2xl sm:text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase" style={{ fontFamily: "var(--font-display)" }}>
                        Link shortener
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 font-medium mt-2">
                        Create short links like {bioBaseUrl ? `${bioBaseUrl}/curriculum` : "portyo.me/p/username/curriculum"}
                        {customDomainBaseUrl ? ` and ${customDomainBaseUrl}/curriculum` : ""}.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <section className="lg:col-span-1 bg-white rounded-[20px] border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-lg font-black uppercase tracking-wide mb-4" style={{ fontFamily: "var(--font-display)" }}>
                            New short URL
                        </h2>

                        <form onSubmit={handleCreate} className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        setForm((prev) => ({
                                            ...prev,
                                            title,
                                            slug: prev.slug ? prev.slug : normalizeSlug(title),
                                        }));
                                    }}
                                    className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium"
                                    placeholder="Curriculum"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</label>
                                <input
                                    value={form.slug}
                                    onChange={(e) => setForm((prev) => ({ ...prev, slug: normalizeSlug(e.target.value) }))}
                                    className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium"
                                    placeholder="curriculum"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Destination URL</label>
                                <input
                                    type="url"
                                    value={form.destinationUrl}
                                    onChange={(e) => setForm((prev) => ({ ...prev, destinationUrl: e.target.value }))}
                                    className="mt-1 w-full px-3 py-2.5 border-2 border-black rounded-xl font-medium"
                                    placeholder="https://example.com/cv"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 rounded-xl bg-[#C6F035] border-2 border-black font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all disabled:opacity-60"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create short URL
                                </span>
                            </button>
                        </form>
                    </section>

                    <section className="lg:col-span-2 bg-white rounded-[20px] border-4 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-lg font-black uppercase tracking-wide mb-4" style={{ fontFamily: "var(--font-display)" }}>
                            Your short URLs
                        </h2>

                        {loading ? (
                            <div className="py-12 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                Loading links...
                            </div>
                        ) : links.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-2xl">
                                <LinkIcon className="w-8 h-8 mx-auto mb-2" />
                                No short URLs yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {links.map((item) => {
                                    const portyoUrl = `${bioBaseUrl}/${item.slug}`;
                                    const customUrl = customDomainBaseUrl ? `${customDomainBaseUrl}/${item.slug}` : null;

                                    return (
                                        <article key={item.id} className="border-2 border-black rounded-2xl p-3 sm:p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-black text-[#1A1A1A] truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{item.clicks} clicks</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 border-2 border-black rounded-lg hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                                    <span className="text-xs font-mono truncate flex-1">{portyoUrl}</span>
                                                    <button onClick={() => copy(portyoUrl)} className="p-1.5 rounded hover:bg-gray-200" title="Copy Portyo URL">
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {customUrl && (
                                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                                        <span className="text-xs font-mono truncate flex-1">{customUrl}</span>
                                                        <button onClick={() => copy(customUrl)} className="p-1.5 rounded hover:bg-gray-200" title="Copy custom domain URL">
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-500 truncate">→ {item.destinationUrl}</p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthorizationGuard>
    );
}

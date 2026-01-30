import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData, useLoaderData } from "react-router";
import { Megaphone, Save, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { api } from "~/services/api";

export default function AnnouncementManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        text: "",
        link: "",
        isNew: true,
        isVisible: true
    });

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            setLoading(true);
            const res = await api.get("/public/settings/announcement");
            setFormData(res.data);
        } catch (error) {
            console.error("Failed to fetch announcement", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        try {
            await api.post("/admin/announcement", formData);
            setSuccess(true);
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update announcement", error);
            alert("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcement Bar</h1>
                </div>
                <p className="text-gray-500">
                    Manage the notification bar that appears at the top of the website.
                </p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Website Header Bar</h2>
                        <p className="text-sm text-gray-500">The notification bar that appears at the top of the website for all visitors.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Preview */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Live Preview</label>
                            <div className="w-full bg-black text-white py-2.5 px-4 rounded-lg flex items-center justify-between text-xs md:text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    {formData.isNew && <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider">New</span>}
                                    <span>{formData.text || "Your announcement text..."}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#d0f224]">
                                    Get Started <span>→</span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Visibility Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-bold text-gray-900">Enable Announcement</label>
                                <p className="text-xs text-text-muted">Show this announcement on the top of the website</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isVisible}
                                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {/* New Badge Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-bold text-gray-900">Show "NEW" Badge</label>
                                <p className="text-xs text-text-muted">Display a small "NEW" badge next to the text</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isNew}
                                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {/* Text Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-main uppercase tracking-wider">Announcement Text</label>
                            <input
                                type="text"
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder="e.g. Launch your bio page in seconds!"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        {/* Link Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-main uppercase tracking-wider">Action Link</label>
                            <div className="relative">
                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="e.g. /sign-up"
                                    className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                        {success && (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                                <CheckCircle className="w-4 h-4" />
                                Saved successfully
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:translate-y-[-1px] active:translate-y-[0px]"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <BroadcastForm />
        </div>
    );
}

function BroadcastForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [data, setData] = useState({
        title: "",
        message: "",
        icon: "Megaphone",
        link: ""
    });

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to send this notification to ALL users?")) return;

        setLoading(true);
        setSuccess(false);

        try {
            await api.post("/admin/notifications/broadcast", data);
            setSuccess(true);
            setData({ title: "", message: "", icon: "Megaphone", link: "" });
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Failed to broadcast", error);
            alert("Failed to send notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleBroadcast} className="mt-8 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Global Notification Broadcast</h2>
                        <p className="text-sm text-gray-500">Send an in-app notification to ALL registered users.</p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Use with caution
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-main uppercase tracking-wider">Title</label>
                            <input
                                required
                                type="text"
                                value={data.title}
                                onChange={(e) => setData({ ...data, title: e.target.value })}
                                placeholder="e.g. New Feature Alert! 🚀"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-main uppercase tracking-wider">Icon (Lucide Name)</label>
                            <input
                                type="text"
                                value={data.icon}
                                onChange={(e) => setData({ ...data, icon: e.target.value })}
                                placeholder="e.g. Megaphone, Gift, AlertTriangle"
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">Message</label>
                        <textarea
                            required
                            value={data.message}
                            onChange={(e) => setData({ ...data, message: e.target.value })}
                            placeholder="Type your message here..."
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">Action Link (Optional)</label>
                        <input
                            type="text"
                            value={data.link}
                            onChange={(e) => setData({ ...data, link: e.target.value })}
                            placeholder="e.g. /dashboard/new-feature"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    {success && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle className="w-4 h-4" />
                            Sent to all users!
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white hover:bg-gray-800 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:translate-y-[-1px] active:translate-y-[0px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Megaphone className="w-4 h-4" />
                                Send Notification
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

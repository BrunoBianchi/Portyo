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
                <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#D2E823] border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Megaphone className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                    <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Announcement Bar</h1>
                </div>
                <p className="text-lg text-gray-500 font-medium max-w-xl">
                    Manage the notification bar that appears at the top of the website.
                </p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="p-8 border-b-2 border-gray-100">
                        <h2 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>Website Header Bar</h2>
                        <p className="text-gray-500 font-medium mt-1">The notification bar that appears at the top of the website for all visitors.</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Preview */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Live Preview</label>
                            <div className="w-full bg-[#1A1A1A] text-white py-3 px-6 rounded-xl flex items-center justify-between text-sm md:text-base font-medium shadow-md border-2 border-black">
                                <div className="flex items-center gap-3">
                                    {formData.isNew && <span className="px-2 py-0.5 bg-[#D2E823] text-black rounded text-[10px] font-black uppercase tracking-wider border border-transparent">New</span>}
                                    <span className="font-bold">{formData.text || "Your announcement text..."}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#D2E823] font-bold text-sm">
                                    Get Started <ExternalLink className="w-3.5 h-3.5" strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Visibility Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-gray-200 transition-colors">
                            <div className="space-y-0.5">
                                <label className="text-base font-bold text-[#1A1A1A]">Enable Announcement</label>
                                <p className="text-sm text-gray-500 font-medium">Show this announcement on the top of the website</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isVisible}
                                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D2E823] peer-checked:border-2 peer-checked:border-black box-border border-2 border-transparent peer-checked:after:border-black"></div>
                            </label>
                        </div>

                        {/* New Badge Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-gray-200 transition-colors">
                            <div className="space-y-0.5">
                                <label className="text-base font-bold text-[#1A1A1A]">Show "NEW" Badge</label>
                                <p className="text-sm text-gray-500 font-medium">Display a small "NEW" badge next to the text</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isNew}
                                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D2E823] peer-checked:border-2 peer-checked:border-black box-border border-2 border-transparent peer-checked:after:border-black"></div>
                            </label>
                        </div>

                        {/* Text Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Announcement Text</label>
                            <input
                                type="text"
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder="e.g. Launch your bio page in seconds!"
                                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base font-bold text-[#1A1A1A] focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                            />
                        </div>

                        {/* Link Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Action Link</label>
                            <div className="relative">
                                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="e.g. /sign-up"
                                    className="w-full rounded-xl border-2 border-gray-200 pl-11 pr-4 py-3 text-base font-bold text-[#1A1A1A] focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-end gap-4">
                        {success && (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 bg-green-100 px-4 py-2 rounded-lg border-2 border-green-200">
                                <CheckCircle className="w-4 h-4" />
                                Saved successfully
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#C6F035] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed hover:bg-[#d9fc5c]"
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
        <form onSubmit={handleBroadcast} className="mt-12 space-y-8">
            <div className="bg-white rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-8 border-b-2 border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>Global Notification Broadcast</h2>
                        <p className="text-gray-500 font-medium mt-1">Send an in-app notification to ALL registered users.</p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 border-2 border-amber-200 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(251,191,36,1)]">
                        Use with caution
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Title</label>
                            <input
                                required
                                type="text"
                                value={data.title}
                                onChange={(e) => setData({ ...data, title: e.target.value })}
                                placeholder="e.g. New Feature Alert! 🚀"
                                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base font-bold text-[#1A1A1A] focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Icon (Lucide Name)</label>
                            <input
                                type="text"
                                value={data.icon}
                                onChange={(e) => setData({ ...data, icon: e.target.value })}
                                placeholder="e.g. Megaphone, Gift, AlertTriangle"
                                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base font-bold text-[#1A1A1A] focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Message</label>
                        <textarea
                            required
                            value={data.message}
                            onChange={(e) => setData({ ...data, message: e.target.value })}
                            placeholder="Type your message here..."
                            rows={3}
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base font-bold text-[#1A1A1A] focus:border-black focus:ring-0 outline-none transition-all resize-none placeholder:text-gray-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Action Link (Optional)</label>
                        <input
                            type="text"
                            value={data.link}
                            onChange={(e) => setData({ ...data, link: e.target.value })}
                            placeholder="e.g. /dashboard/new-feature"
                            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base font-bold text-[#1A1A1A] focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-end gap-4">
                    {success && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 bg-green-100 px-4 py-2 rounded-lg border-2 border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            Sent to all users!
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-8 py-3 rounded-xl font-black text-sm border-2 border-black hover:bg-[#333] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
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

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths, eachDayOfInterval } from "date-fns";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Plus,
    Send,
    Trash2,
    X,
    CheckCircle2,
    AlertTriangle,
    Ban,
    Pencil,
    Upload,
    Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthorizationGuard } from "~/contexts/guard.context";
import BioContext from "~/contexts/bio.context";
import { api } from "~/services/api";

type PlannerChannel = "instagram" | "facebook" | "linkedin" | "twitter";
type PlannerStatus = "draft" | "scheduled" | "published" | "failed" | "cancelled";

interface SocialPlannerPost {
    id: string;
    bioId: string;
    channel: PlannerChannel;
    status: PlannerStatus;
    title: string | null;
    content: string;
    mediaUrls: string[] | null;
    hashtags: string[] | null;
    timezone: string;
    scheduledAt: string | null;
    publishedAt: string | null;
    externalPostId: string | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

interface PlannerSummary {
    total: number;
    draft: number;
    scheduled: number;
    published: number;
    failed: number;
    cancelled: number;
    upcoming: number;
}

const CHANNELS: PlannerChannel[] = ["instagram", "facebook", "linkedin", "twitter"];

const statusClassMap: Record<PlannerStatus, string> = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function DashboardSocialPlanner() {
    const { t } = useTranslation();
    const { bio } = useContext(BioContext);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedChannel, setSelectedChannel] = useState<PlannerChannel | "all">("all");
    const [posts, setPosts] = useState<SocialPlannerPost[]>([]);
    const [summary, setSummary] = useState<PlannerSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [composerOpen, setComposerOpen] = useState(false);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    const [formData, setFormData] = useState({
        channel: "instagram" as PlannerChannel,
        title: "",
        content: "",
        hashtags: "",
        mediaUrls: "",
        scheduledAt: "",
    });

    const calendarStart = useMemo(
        () => startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        [currentMonth]
    );
    const calendarEnd = useMemo(
        () => endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
        [currentMonth]
    );

    const calendarDays = useMemo(
        () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
        [calendarStart, calendarEnd]
    );

    const loadData = useCallback(async () => {
        if (!bio?.id) {
            setPosts([]);
            setSummary(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [postsRes, summaryRes] = await Promise.all([
                api.get(`/social-planner/${bio.id}/posts`, {
                    params: {
                        startDate: calendarStart.toISOString(),
                        endDate: calendarEnd.toISOString(),
                        channel: selectedChannel,
                        status: "all",
                    },
                }),
                api.get(`/social-planner/${bio.id}/summary`),
            ]);

            setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
            setSummary(summaryRes.data || null);
        } catch (error) {
            console.error("Failed to load social planner data", error);
        } finally {
            setLoading(false);
        }
    }, [bio?.id, calendarStart, calendarEnd, selectedChannel]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const queuePosts = useMemo(() => {
        return [...posts]
            .filter((post) => ["scheduled", "draft", "failed"].includes(post.status))
            .sort((a, b) => {
                const aDate = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
                const bDate = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
                return aDate - bDate;
            });
    }, [posts]);

    const selectedDatePosts = useMemo(() => {
        return posts.filter((post) => {
            if (!post.scheduledAt) return false;
            return isSameDay(new Date(post.scheduledAt), selectedDate);
        });
    }, [posts, selectedDate]);

    const minScheduleDateTime = useMemo(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"), []);

    const postsByDay = useMemo(() => {
        const map = new Map<string, number>();
        for (const post of posts) {
            if (!post.scheduledAt) continue;
            const key = format(new Date(post.scheduledAt), "yyyy-MM-dd");
            map.set(key, (map.get(key) || 0) + 1);
        }
        return map;
    }, [posts]);

    const resetComposer = () => {
        setEditingPostId(null);
        setFormData({
            channel: "instagram",
            title: "",
            content: "",
            hashtags: "",
            mediaUrls: "",
            scheduledAt: "",
        });
    };

    const openCreateComposer = () => {
        resetComposer();
        setComposerOpen(true);
    };

    const openEditComposer = (post: SocialPlannerPost) => {
        setEditingPostId(post.id);
        setFormData({
            channel: post.channel,
            title: post.title || "",
            content: post.content,
            hashtags: (post.hashtags || []).join(", "),
            mediaUrls: (post.mediaUrls || []).join("\n"),
            scheduledAt: post.scheduledAt ? format(new Date(post.scheduledAt), "yyyy-MM-dd'T'HH:mm") : "",
        });
        setComposerOpen(true);
    };

    const handleSavePost = async () => {
        if (!bio?.id || !formData.content.trim()) return;

        if (!formData.scheduledAt) {
            alert(t("dashboard.socialPlanner.errors.scheduleRequired", { defaultValue: "Choose a schedule date/time to create this post." }));
            return;
        }

        const scheduledDate = new Date(formData.scheduledAt);
        if (scheduledDate <= new Date()) {
            alert(t("dashboard.socialPlanner.errors.schedulePast", { defaultValue: "You cannot schedule posts in the past." }));
            return;
        }

        setSaving(true);
        try {
            const payload = {
                channel: formData.channel,
                title: formData.title.trim() || null,
                content: formData.content.trim(),
                hashtags: formData.hashtags
                    .split(",")
                    .map((hashtag) => hashtag.trim())
                    .filter(Boolean),
                mediaUrls: formData.mediaUrls
                    .split("\n")
                    .map((url) => url.trim())
                    .filter(Boolean),
                scheduledAt: scheduledDate.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
            };

            if (editingPostId) {
                await api.patch(`/social-planner/${bio.id}/posts/${editingPostId}`, payload);
            } else {
                await api.post(`/social-planner/${bio.id}/posts`, payload);
            }

            setComposerOpen(false);
            resetComposer();
            await loadData();
        } catch (error) {
            console.error("Failed to save social planner post", error);
            const backendMessage = (error as any)?.response?.data?.message;
            const backendIssues = (error as any)?.response?.data?.issues;
            if (backendIssues) {
                console.error("Social planner validation issues:", backendIssues);
            }

            alert(backendMessage || t("dashboard.socialPlanner.errors.save", { defaultValue: "Could not save post." }));
        } finally {
            setSaving(false);
        }
    };

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!bio?.id) return;

        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingMedia(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formDataUpload = new FormData();
                formDataUpload.append("image", file);
                const response = await api.post(`/portfolio/${bio.id}/upload`, formDataUpload, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                return response.data?.url as string;
            });

            const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean);

            if (uploadedUrls.length > 0) {
                setFormData((prev) => {
                    const currentUrls = prev.mediaUrls
                        .split("\n")
                        .map((url) => url.trim())
                        .filter(Boolean);

                    const merged = [...currentUrls, ...uploadedUrls];
                    return {
                        ...prev,
                        mediaUrls: merged.join("\n"),
                    };
                });
            }
        } catch (error) {
            console.error("Failed to upload social planner media", error);
            alert(t("dashboard.socialPlanner.errors.upload", { defaultValue: "Failed to upload image(s)." }));
        } finally {
            setUploadingMedia(false);
            e.target.value = "";
        }
    };

    const handlePublishNow = async (postId: string) => {
        if (!bio?.id) return;
        try {
            await api.post(`/social-planner/${bio.id}/posts/${postId}/publish-now`);
            await loadData();
        } catch (error: any) {
            console.error("Failed to publish now", error);
            alert(error?.response?.data?.message || t("dashboard.socialPlanner.errors.publish", { defaultValue: "Could not publish now." }));
            await loadData();
        }
    };

    const handleCancel = async (postId: string) => {
        if (!bio?.id) return;
        try {
            await api.post(`/social-planner/${bio.id}/posts/${postId}/cancel`);
            await loadData();
        } catch (error) {
            console.error("Failed to cancel post", error);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!bio?.id) return;
        if (!confirm(t("dashboard.socialPlanner.confirmDelete", { defaultValue: "Delete this post?" }))) {
            return;
        }

        try {
            await api.delete(`/social-planner/${bio.id}/posts/${postId}`);
            await loadData();
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    return (
        <AuthorizationGuard minPlan="standard">
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
                            {t("dashboard.nav.socialPlanner", { defaultValue: "Social planner" })}
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            {t("dashboard.socialPlanner.subtitle", { defaultValue: "Plan, queue and publish your social content in one place." })}
                        </p>
                    </div>

                    <button
                        onClick={openCreateComposer}
                        className="inline-flex items-center gap-2 px-4 py-3 bg-[#C6F035] border-2 border-black rounded-xl font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        {t("dashboard.socialPlanner.newPost", { defaultValue: "New post" })}
                    </button>
                </div>

                {!bio?.id ? (
                    <div className="bg-white rounded-[24px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-center text-gray-600 font-medium">
                        {t("dashboard.socialPlanner.selectBio", { defaultValue: "Select a bio to start using Social Planner." })}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            {[
                                { key: "total", value: summary?.total ?? 0 },
                                { key: "scheduled", value: summary?.scheduled ?? 0 },
                                { key: "upcoming", value: summary?.upcoming ?? 0 },
                                { key: "published", value: summary?.published ?? 0 },
                                { key: "failed", value: summary?.failed ?? 0 },
                                { key: "draft", value: summary?.draft ?? 0 },
                            ].map((item) => (
                                <div key={item.key} className="bg-white border-2 border-black rounded-[16px] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[11px] uppercase tracking-wider font-black text-gray-500">
                                        {t(`dashboard.socialPlanner.metrics.${item.key}`, { defaultValue: item.key })}
                                    </p>
                                    <p className="text-2xl font-black text-[#1A1A1A] mt-1">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedChannel("all")}
                                className={`px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all ${selectedChannel === "all" ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}
                            >
                                {t("dashboard.socialPlanner.channels.all", { defaultValue: "All channels" })}
                            </button>
                            {CHANNELS.map((channel) => (
                                <button
                                    key={channel}
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all capitalize ${selectedChannel === channel ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}
                                >
                                    {t(`dashboard.socialPlanner.channels.${channel}`, { defaultValue: channel })}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            <div className="xl:col-span-7 bg-white border-2 border-black rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        {t("dashboard.socialPlanner.calendar", { defaultValue: "Calendar" })}
                                    </h2>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 border-2 border-black rounded-lg hover:bg-gray-50">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="font-black text-sm min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
                                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 border-2 border-black rounded-lg hover:bg-gray-50">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 mb-2">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                                        <div key={label} className="text-center text-xs font-black text-gray-400 uppercase py-2">
                                            {label}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1.5">
                                    {calendarDays.map((day) => {
                                        const key = format(day, "yyyy-MM-dd");
                                        const count = postsByDay.get(key) || 0;
                                        const isSelected = isSameDay(day, selectedDate);

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedDate(day)}
                                                className={`h-20 rounded-xl border-2 p-2 text-left transition-all ${isSelected ? "border-black bg-[#d2e823]/40" : "border-gray-200 bg-white hover:border-black"} ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}`}
                                            >
                                                <div className="text-xs font-black text-[#1A1A1A]">{format(day, "d")}</div>
                                                {count > 0 && (
                                                    <div className="mt-2 inline-flex px-1.5 py-0.5 rounded-md bg-black text-white text-[10px] font-black">
                                                        {count}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-5">
                                    <h3 className="text-sm font-black text-[#1A1A1A] mb-2">
                                        {t("dashboard.socialPlanner.dayPosts", { defaultValue: "Posts on selected day" })}
                                    </h3>
                                    {selectedDatePosts.length === 0 ? (
                                        <p className="text-sm text-gray-500">{t("dashboard.socialPlanner.emptyDay", { defaultValue: "No scheduled posts on this day." })}</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedDatePosts.map((post) => (
                                                <div key={post.id} className="p-3 border-2 border-black rounded-xl bg-white flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-bold text-sm text-[#1A1A1A] capitalize">{post.channel}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{post.content}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border capitalize ${statusClassMap[post.status]}`}>
                                                        {post.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="xl:col-span-5 bg-white border-2 border-black rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
                                <h2 className="text-lg font-black text-[#1A1A1A] mb-4">
                                    {t("dashboard.socialPlanner.queue", { defaultValue: "Queue" })}
                                </h2>

                                {loading ? (
                                    <div className="h-52 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-black" />
                                    </div>
                                ) : queuePosts.length === 0 ? (
                                    <div className="h-52 flex items-center justify-center text-center text-sm text-gray-500 font-medium px-6">
                                        {t("dashboard.socialPlanner.emptyQueue", { defaultValue: "No posts in queue yet. Create your first post." })}
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                                        {queuePosts.map((post) => (
                                            <div key={post.id} className="border-2 border-black rounded-xl p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-500">{post.channel}</p>
                                                        <p className="font-bold text-[#1A1A1A] line-clamp-2">{post.title || post.content}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border capitalize ${statusClassMap[post.status]}`}>
                                                        {post.status}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{post.content}</p>

                                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {post.scheduledAt ? format(parseISO(post.scheduledAt), "dd/MM/yyyy HH:mm") : t("dashboard.socialPlanner.unscheduled", { defaultValue: "Unscheduled" })}
                                                    </span>
                                                </div>

                                                {post.errorMessage && (
                                                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                                                        {post.errorMessage}
                                                    </div>
                                                )}

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <button onClick={() => openEditComposer(post)} className="px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold hover:bg-gray-50 inline-flex items-center gap-1">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        {t("dashboard.socialPlanner.actions.edit", { defaultValue: "Edit" })}
                                                    </button>

                                                    <button onClick={() => handlePublishNow(post.id)} className="px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold hover:bg-gray-50 inline-flex items-center gap-1">
                                                        <Send className="w-3.5 h-3.5" />
                                                        {t("dashboard.socialPlanner.actions.publishNow", { defaultValue: "Publish now" })}
                                                    </button>

                                                    {post.status === "scheduled" && (
                                                        <button onClick={() => handleCancel(post.id)} className="px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold hover:bg-gray-50 inline-flex items-center gap-1">
                                                            <Ban className="w-3.5 h-3.5" />
                                                            {t("dashboard.socialPlanner.actions.cancel", { defaultValue: "Cancel" })}
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleDelete(post.id)} className="px-2.5 py-1.5 border-2 border-black rounded-lg text-xs font-bold hover:bg-gray-50 inline-flex items-center gap-1 text-red-600">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        {t("dashboard.socialPlanner.actions.delete", { defaultValue: "Delete" })}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {composerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setComposerOpen(false)} />
                        <div className="relative w-full max-w-2xl bg-white rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black text-[#1A1A1A]">
                                    {editingPostId
                                        ? t("dashboard.socialPlanner.editPost", { defaultValue: "Edit post" })
                                        : t("dashboard.socialPlanner.newPost", { defaultValue: "New post" })}
                                </h3>
                                <button onClick={() => setComposerOpen(false)} className="p-2 border-2 border-black rounded-lg hover:bg-gray-50">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                        {t("dashboard.socialPlanner.fields.channel", { defaultValue: "Channel" })}
                                    </label>
                                    <select
                                        value={formData.channel}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, channel: e.target.value as PlannerChannel }))}
                                        className="w-full border-2 border-black rounded-xl px-3 py-2.5 font-bold"
                                    >
                                        {CHANNELS.map((channel) => (
                                            <option key={channel} value={channel}>
                                                {t(`dashboard.socialPlanner.channels.${channel}`, { defaultValue: channel })}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                        {t("dashboard.socialPlanner.fields.title", { defaultValue: "Title (optional)" })}
                                    </label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                        className="w-full border-2 border-black rounded-xl px-3 py-2.5 font-medium"
                                        placeholder={t("dashboard.socialPlanner.placeholders.title", { defaultValue: "Campaign title" })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                        {t("dashboard.socialPlanner.fields.content", { defaultValue: "Post content" })}
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={formData.content}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                                        className="w-full border-2 border-black rounded-xl px-3 py-2.5 font-medium resize-none"
                                        placeholder={t("dashboard.socialPlanner.placeholders.content", { defaultValue: "Write your post copy..." })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                            {t("dashboard.socialPlanner.fields.hashtags", { defaultValue: "Hashtags" })}
                                        </label>
                                        <input
                                            value={formData.hashtags}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, hashtags: e.target.value }))}
                                            className="w-full border-2 border-black rounded-xl px-3 py-2.5 font-medium"
                                            placeholder="#marketing, #creator"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                            {t("dashboard.socialPlanner.fields.scheduledAt", { defaultValue: "Schedule date/time" })}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.scheduledAt}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                                            min={minScheduleDateTime}
                                            className="w-full border-2 border-black rounded-xl px-3 py-2.5 font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2 block">
                                        {t("dashboard.socialPlanner.fields.media", { defaultValue: "Media URLs (one per line)" })}
                                    </label>
                                    <div className="mb-2.5 flex items-center gap-2">
                                        <label className="inline-flex items-center gap-2 px-3 py-2 border-2 border-black rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors">
                                            {uploadingMedia ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                            {uploadingMedia
                                                ? t("dashboard.socialPlanner.actions.uploading", { defaultValue: "Uploading..." })
                                                : t("dashboard.socialPlanner.actions.uploadImages", { defaultValue: "Upload image(s)" })}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleMediaUpload}
                                                disabled={uploadingMedia}
                                            />
                                        </label>
                                        <span className="text-xs text-gray-500 font-medium inline-flex items-center gap-1">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            {t("dashboard.socialPlanner.mediaHint", { defaultValue: "Supported: JPG, PNG, WEBP, GIF" })}
                                        </span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={formData.mediaUrls}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, mediaUrls: e.target.value }))}
                                        className="w-full border-2 border-black rounded-xl px-3 py-2.5 font-medium resize-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-2">
                                <button onClick={() => setComposerOpen(false)} className="px-4 py-2.5 border-2 border-black rounded-xl font-bold hover:bg-gray-50">
                                    {t("dashboard.socialPlanner.actions.close", { defaultValue: "Close" })}
                                </button>
                                <button
                                    onClick={handleSavePost}
                                    disabled={saving || !formData.content.trim() || !formData.scheduledAt}
                                    className="px-4 py-2.5 bg-[#C6F035] border-2 border-black rounded-xl font-black text-black disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {editingPostId
                                        ? t("dashboard.socialPlanner.actions.update", { defaultValue: "Update" })
                                        : t("dashboard.socialPlanner.actions.save", { defaultValue: "Save" })}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && bio?.id && posts.length === 0 && (
                    <div className="hidden" aria-hidden>
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                )}
            </div>
        </AuthorizationGuard>
    );
}

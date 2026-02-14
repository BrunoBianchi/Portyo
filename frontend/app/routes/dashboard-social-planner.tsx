import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths, subWeeks, eachDayOfInterval } from "date-fns";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
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
type CalendarViewMode = "weekly" | "monthly";

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

interface AIQueueSuggestion {
    channel: PlannerChannel;
    title: string;
    content: string;
    hashtags: string[];
    scheduledAt: string;
    reason: string;
    confidence: number;
}

const CHANNELS: PlannerChannel[] = ["instagram", "facebook", "linkedin", "twitter"];

const statusClassMap: Record<PlannerStatus, string> = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-amber-50 text-amber-700 border-amber-200",
};

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function DashboardSocialPlanner() {
    const { t } = useTranslation();
    const { bio } = useContext(BioContext);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>("weekly");
    const [selectedChannel, setSelectedChannel] = useState<PlannerChannel | "all">("all");
    const [posts, setPosts] = useState<SocialPlannerPost[]>([]);
    const [summary, setSummary] = useState<PlannerSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reschedulingPostId, setReschedulingPostId] = useState<string | null>(null);
    const [draggingPostId, setDraggingPostId] = useState<string | null>(null);
    const [dropTargetDateKey, setDropTargetDateKey] = useState<string | null>(null);
    const [composerOpen, setComposerOpen] = useState(false);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [aiPlanning, setAiPlanning] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AIQueueSuggestion[]>([]);

    const [aiPlanOptions, setAiPlanOptions] = useState({
        postsCount: 8,
        horizonDays: 28,
        objective: "reach" as "reach" | "engagement" | "traffic" | "conversions",
        avoidWeekends: true,
        preferredHourStart: 9,
        preferredHourEnd: 21,
        minGapHours: 12,
    });

    const [formData, setFormData] = useState({
        channel: "instagram" as PlannerChannel,
        title: "",
        content: "",
        hashtags: "",
        mediaUrls: [] as string[],
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

    const weeklyStart = useMemo(
        () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
        [selectedDate]
    );

    const weeklyEnd = useMemo(
        () => endOfWeek(selectedDate, { weekStartsOn: 0 }),
        [selectedDate]
    );

    const weeklyDays = useMemo(
        () => eachDayOfInterval({ start: weeklyStart, end: weeklyEnd }),
        [weeklyStart, weeklyEnd]
    );

    const dataRangeStart = useMemo(
        () => (calendarViewMode === "weekly" ? weeklyStart : calendarStart),
        [calendarViewMode, weeklyStart, calendarStart]
    );

    const dataRangeEnd = useMemo(
        () => (calendarViewMode === "weekly" ? weeklyEnd : calendarEnd),
        [calendarViewMode, weeklyEnd, calendarEnd]
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
                        startDate: dataRangeStart.toISOString(),
                        endDate: dataRangeEnd.toISOString(),
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
    }, [bio?.id, dataRangeStart, dataRangeEnd, selectedChannel]);

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

    const postsGroupedByDay = useMemo(() => {
        const map = new Map<string, SocialPlannerPost[]>();
        for (const post of posts) {
            if (!post.scheduledAt) continue;
            const key = format(new Date(post.scheduledAt), "yyyy-MM-dd");
            const current = map.get(key) || [];
            current.push(post);
            map.set(key, current);
        }

        for (const [key, value] of map.entries()) {
            value.sort((a, b) => {
                const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
                const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
                return aTime - bTime;
            });
            map.set(key, value);
        }

        return map;
    }, [posts]);

    const postById = useMemo(() => {
        const map = new Map<string, SocialPlannerPost>();
        for (const post of posts) {
            map.set(post.id, post);
        }
        return map;
    }, [posts]);

    const getChannelBadgeClass = (channel: PlannerChannel) => {
        switch (channel) {
            case "instagram":
                return "bg-pink-50 text-pink-700 border-pink-200";
            case "facebook":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "linkedin":
                return "bg-cyan-50 text-cyan-700 border-cyan-200";
            case "twitter":
                return "bg-slate-50 text-slate-700 border-slate-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const resetComposer = () => {
        setEditingPostId(null);
        setFormData({
            channel: "instagram",
            title: "",
            content: "",
            hashtags: "",
            mediaUrls: [],
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
            mediaUrls: post.mediaUrls || [],
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
                mediaUrls: formData.mediaUrls,
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
                    const merged = [...prev.mediaUrls, ...uploadedUrls];
                    return {
                        ...prev,
                        mediaUrls: merged,
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

    const handleGenerateAIQueue = async (apply: boolean) => {
        if (!bio?.id) return;

        setAiPlanning(true);
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
            const response = await api.post(`/social-planner/${bio.id}/queue/auto-plan`, {
                apply,
                options: {
                    timezone,
                    channels: selectedChannel === "all" ? CHANNELS : [selectedChannel],
                    postsCount: aiPlanOptions.postsCount,
                    horizonDays: aiPlanOptions.horizonDays,
                    preferredHourStart: aiPlanOptions.preferredHourStart,
                    preferredHourEnd: aiPlanOptions.preferredHourEnd,
                    minGapHours: aiPlanOptions.minGapHours,
                    objective: aiPlanOptions.objective,
                    avoidWeekends: aiPlanOptions.avoidWeekends,
                },
            });

            setAiSuggestions(Array.isArray(response.data?.queue) ? response.data.queue : []);

            if (apply) {
                await loadData();
            }
        } catch (error: any) {
            console.error("Failed to generate AI queue", error);
            alert(error?.response?.data?.message || t("dashboard.socialPlanner.errors.save", { defaultValue: "Could not save post." }));
        } finally {
            setAiPlanning(false);
        }
    };

    const moveMediaItem = (index: number, direction: "up" | "down") => {
        setFormData((prev) => {
            const next = [...prev.mediaUrls];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= next.length) {
                return prev;
            }

            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;

            return {
                ...prev,
                mediaUrls: next,
            };
        });
    };

    const removeMediaItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            mediaUrls: prev.mediaUrls.filter((_, currentIndex) => currentIndex !== index),
        }));
    };

    const canDragPost = (post: SocialPlannerPost) => {
        if (!post.scheduledAt) return false;
        return post.status !== "published" && post.status !== "cancelled";
    };

    const handlePostDragStart = (event: React.DragEvent<HTMLElement>, postId: string) => {
        setDraggingPostId(postId);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", postId);
    };

    const resetDragState = () => {
        setDraggingPostId(null);
        setDropTargetDateKey(null);
    };

    const handleDayDragOver = (event: React.DragEvent<HTMLElement>, dateKey: string) => {
        if (!draggingPostId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (dropTargetDateKey !== dateKey) {
            setDropTargetDateKey(dateKey);
        }
    };

    const handlePostDropOnDay = async (event: React.DragEvent<HTMLElement>, targetDay: Date) => {
        event.preventDefault();

        const postId = draggingPostId || event.dataTransfer.getData("text/plain");
        if (!postId || !bio?.id) {
            resetDragState();
            return;
        }

        const post = postById.get(postId);
        if (!post || !post.scheduledAt) {
            resetDragState();
            return;
        }

        const currentDate = new Date(post.scheduledAt);
        const targetDateTime = new Date(targetDay);
        targetDateTime.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);

        const fromKey = format(currentDate, "yyyy-MM-dd");
        const toKey = format(targetDateTime, "yyyy-MM-dd");
        if (fromKey === toKey) {
            resetDragState();
            return;
        }

        if (targetDateTime <= new Date()) {
            alert(t("dashboard.socialPlanner.errors.schedulePast", { defaultValue: "You cannot schedule posts in the past." }));
            resetDragState();
            return;
        }

        setReschedulingPostId(postId);
        try {
            await api.patch(`/social-planner/${bio.id}/posts/${postId}`, {
                scheduledAt: targetDateTime.toISOString(),
            });
            setSelectedDate(targetDay);
            await loadData();
        } catch (error: any) {
            console.error("Failed to move post schedule", error);
            alert(error?.response?.data?.message || t("dashboard.socialPlanner.errors.save", { defaultValue: "Could not save post." }));
        } finally {
            setReschedulingPostId(null);
            resetDragState();
        }
    };

    return (
        <AuthorizationGuard minPlan="standard">
            <div className="p-3 sm:p-4 lg:p-8 space-y-5 sm:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
                            {t("dashboard.nav.socialPlanner", { defaultValue: "Social planner" })}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">
                            {t("dashboard.socialPlanner.subtitle", { defaultValue: "Plan, queue and publish your social content in one place." })}
                        </p>
                    </div>

                    <button
                        onClick={openCreateComposer}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#C6F035] border-2 border-black rounded-xl font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
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

                        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <button
                                onClick={() => setSelectedChannel("all")}
                                className={`shrink-0 px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all ${selectedChannel === "all" ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}
                            >
                                {t("dashboard.socialPlanner.channels.all", { defaultValue: "All channels" })}
                            </button>
                            {CHANNELS.map((channel) => (
                                <button
                                    key={channel}
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`shrink-0 px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all capitalize ${selectedChannel === channel ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}
                                >
                                    {t(`dashboard.socialPlanner.channels.${channel}`, { defaultValue: channel })}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white border-2 border-black rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-[#1A1A1A]">
                                        {t("dashboard.socialPlanner.aiQueue.title", { defaultValue: "AI Queue Planner (BAML + TOON)" })}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                                        {t("dashboard.socialPlanner.aiQueue.subtitle", { defaultValue: "Generate an automatic posting queue optimized for best day/time windows and keep everything customizable." })}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleGenerateAIQueue(false)}
                                        disabled={aiPlanning}
                                        className="px-3 py-2 border-2 border-black rounded-xl font-black text-sm bg-white"
                                    >
                                        {aiPlanning ? (
                                            <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t("dashboard.socialPlanner.aiQueue.generating", { defaultValue: "Generating..." })}</span>
                                        ) : (
                                            t("dashboard.socialPlanner.aiQueue.preview", { defaultValue: "Generate preview" })
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleGenerateAIQueue(true)}
                                        disabled={aiPlanning}
                                        className="px-3 py-2 border-2 border-black rounded-xl font-black text-sm bg-[#C6F035]"
                                    >
                                        {t("dashboard.socialPlanner.aiQueue.apply", { defaultValue: "Generate and add to queue" })}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-black text-gray-500 block mb-1">{t("dashboard.socialPlanner.aiQueue.postsCount", { defaultValue: "Posts" })}</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={aiPlanOptions.postsCount}
                                        onChange={(e) => setAiPlanOptions((prev) => ({ ...prev, postsCount: Math.max(1, Math.min(60, Number(e.target.value) || 1)) }))}
                                        className="w-full border-2 border-black rounded-lg px-2.5 py-2 text-sm font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-black text-gray-500 block mb-1">{t("dashboard.socialPlanner.aiQueue.horizonDays", { defaultValue: "Horizon (days)" })}</label>
                                    <input
                                        type="number"
                                        min={3}
                                        max={120}
                                        value={aiPlanOptions.horizonDays}
                                        onChange={(e) => setAiPlanOptions((prev) => ({ ...prev, horizonDays: Math.max(3, Math.min(120, Number(e.target.value) || 28)) }))}
                                        className="w-full border-2 border-black rounded-lg px-2.5 py-2 text-sm font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-black text-gray-500 block mb-1">{t("dashboard.socialPlanner.aiQueue.objective", { defaultValue: "Objective" })}</label>
                                    <select
                                        value={aiPlanOptions.objective}
                                        onChange={(e) => setAiPlanOptions((prev) => ({ ...prev, objective: e.target.value as typeof prev.objective }))}
                                        className="w-full border-2 border-black rounded-lg px-2.5 py-2 text-sm font-bold"
                                    >
                                        <option value="reach">Reach</option>
                                        <option value="engagement">Engagement</option>
                                        <option value="traffic">Traffic</option>
                                        <option value="conversions">Conversions</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-black text-gray-500 block mb-1">{t("dashboard.socialPlanner.aiQueue.hourStart", { defaultValue: "Start hour" })}</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={aiPlanOptions.preferredHourStart}
                                        onChange={(e) => setAiPlanOptions((prev) => ({ ...prev, preferredHourStart: Math.max(0, Math.min(23, Number(e.target.value) || 0)) }))}
                                        className="w-full border-2 border-black rounded-lg px-2.5 py-2 text-sm font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-black text-gray-500 block mb-1">{t("dashboard.socialPlanner.aiQueue.hourEnd", { defaultValue: "End hour" })}</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={aiPlanOptions.preferredHourEnd}
                                        onChange={(e) => setAiPlanOptions((prev) => ({ ...prev, preferredHourEnd: Math.max(0, Math.min(23, Number(e.target.value) || 23)) }))}
                                        className="w-full border-2 border-black rounded-lg px-2.5 py-2 text-sm font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-wider font-black text-gray-500 block mb-1">{t("dashboard.socialPlanner.aiQueue.minGap", { defaultValue: "Min gap (h)" })}</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={72}
                                        value={aiPlanOptions.minGapHours}
                                        onChange={(e) => setAiPlanOptions((prev) => ({ ...prev, minGapHours: Math.max(1, Math.min(72, Number(e.target.value) || 12)) }))}
                                        className="w-full border-2 border-black rounded-lg px-2.5 py-2 text-sm font-bold"
                                    />
                                </div>

                                <label className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={aiPlanOptions.avoidWeekends}
                                        onChange={(e) => setAiPlanOptions((prev) => ({ ...prev, avoidWeekends: e.target.checked }))}
                                    />
                                    {t("dashboard.socialPlanner.aiQueue.avoidWeekends", { defaultValue: "Avoid weekends" })}
                                </label>
                            </div>

                            {aiSuggestions.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-500">{t("dashboard.socialPlanner.aiQueue.previewList", { defaultValue: "Suggested queue" })}</p>
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {aiSuggestions.map((item, index) => (
                                            <article key={`${item.channel}-${item.scheduledAt}-${index}`} className="border-2 border-black rounded-xl p-3 bg-[#FCFCFC]">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black uppercase ${getChannelBadgeClass(item.channel)}`}>
                                                            {item.channel}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-600">{format(new Date(item.scheduledAt), "dd/MM/yyyy HH:mm")}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wide text-gray-500">confidence {Math.round(item.confidence)}%</span>
                                                </div>
                                                <p className="text-sm font-bold text-[#1A1A1A] mt-1 line-clamp-2">{item.title || item.content}</p>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.reason}</p>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-white border-2 border-black rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-6">
                                <div className="flex flex-col gap-3 mb-4">
                                    <h2 className="text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        {t("dashboard.socialPlanner.calendar", { defaultValue: "Calendar" })}
                                    </h2>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 w-full">
                                        <div className="inline-flex items-center border-2 border-black rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setCalendarViewMode("weekly")}
                                                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider ${calendarViewMode === "weekly" ? "bg-black text-white" : "bg-white text-black"}`}
                                            >
                                                {t("dashboard.socialPlanner.views.weekly", { defaultValue: "Weekly" })}
                                            </button>
                                            <button
                                                onClick={() => setCalendarViewMode("monthly")}
                                                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider ${calendarViewMode === "monthly" ? "bg-black text-white" : "bg-white text-black"}`}
                                            >
                                                {t("dashboard.socialPlanner.views.monthly", { defaultValue: "Monthly" })}
                                            </button>
                                        </div>

                                        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    if (calendarViewMode === "weekly") {
                                                        const nextDate = subWeeks(selectedDate, 1);
                                                        setSelectedDate(nextDate);
                                                        setCurrentMonth(nextDate);
                                                    } else {
                                                        setCurrentMonth(subMonths(currentMonth, 1));
                                                    }
                                                }}
                                                className="p-2 border-2 border-black rounded-lg hover:bg-gray-50"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            <span className="font-black text-xs sm:text-sm min-w-[148px] sm:min-w-[210px] text-center px-1">
                                                {calendarViewMode === "weekly"
                                                    ? `${format(weeklyStart, "dd MMM")} - ${format(weeklyEnd, "dd MMM yyyy")}`
                                                    : format(currentMonth, "MMMM yyyy")}
                                            </span>

                                            <button
                                                onClick={() => {
                                                    if (calendarViewMode === "weekly") {
                                                        const nextDate = addWeeks(selectedDate, 1);
                                                        setSelectedDate(nextDate);
                                                        setCurrentMonth(nextDate);
                                                    } else {
                                                        setCurrentMonth(addMonths(currentMonth, 1));
                                                    }
                                                }}
                                                className="p-2 border-2 border-black rounded-lg hover:bg-gray-50"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 font-semibold">
                                        {t("dashboard.socialPlanner.dragHint", { defaultValue: "Drag and drop posts between days to quickly reschedule." })}
                                    </p>
                                </div>

                                {calendarViewMode === "weekly" ? (
                                    <div className="overflow-x-auto pb-2">
                                        <div className="grid grid-cols-7 gap-3 min-w-[1220px] xl:min-w-0">
                                            {weeklyDays.map((day) => {
                                                const key = format(day, "yyyy-MM-dd");
                                                const dayPosts = postsGroupedByDay.get(key) || [];
                                                const isTodaySelected = isSameDay(day, selectedDate);

                                                return (
                                                    <div
                                                        key={key}
                                                        onDragOver={(event) => handleDayDragOver(event, key)}
                                                        onDrop={(event) => handlePostDropOnDay(event, day)}
                                                        className={`rounded-2xl border-2 min-h-[240px] md:min-h-[340px] p-3 transition-colors ${isTodaySelected ? "border-black bg-[#d2e823]/15" : "border-gray-200 bg-[#FCFCFC]"} ${dropTargetDateKey === key ? "ring-2 ring-[#C6F035] ring-offset-1 border-black bg-[#C6F035]/10" : ""}`}
                                                    >
                                                        <button
                                                            onClick={() => setSelectedDate(day)}
                                                            className="w-full text-left mb-2"
                                                        >
                                                            <p className="text-[11px] uppercase tracking-wider font-black text-gray-500">{t(`dashboard.socialPlanner.weekdays.${WEEKDAY_KEYS[day.getDay()]}`, { defaultValue: format(day, "EEE") })}</p>
                                                            <p className="text-lg font-black text-[#1A1A1A]">{format(day, "d")}</p>
                                                        </button>

                                                        {dayPosts.length === 0 ? (
                                                            <div className="mt-6 md:mt-8 text-center text-[11px] text-gray-400 font-semibold">
                                                                {t("dashboard.socialPlanner.emptyDay", { defaultValue: "No posts" })}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 max-h-[170px] md:max-h-[260px] overflow-y-auto pr-1">
                                                                {dayPosts.map((post) => (
                                                                    <div
                                                                        key={post.id}
                                                                        draggable={canDragPost(post)}
                                                                        onDragStart={(event) => handlePostDragStart(event, post.id)}
                                                                        onDragEnd={resetDragState}
                                                                        className={`rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm overflow-hidden transition-opacity ${canDragPost(post) ? "cursor-grab active:cursor-grabbing" : "cursor-default"} ${draggingPostId === post.id ? "opacity-60" : "opacity-100"}`}
                                                                    >
                                                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5 min-w-0">
                                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[10px] font-black uppercase max-w-full truncate ${getChannelBadgeClass(post.channel)}`}>
                                                                                {t(`dashboard.socialPlanner.channels.${post.channel}`, { defaultValue: post.channel })}
                                                                            </span>
                                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black border capitalize max-w-full truncate ${statusClassMap[post.status]}`}>
                                                                                {t(`dashboard.socialPlanner.status.${post.status}`, { defaultValue: post.status })}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs font-bold text-[#1A1A1A] line-clamp-2 break-words">{post.title || post.content}</p>
                                                                        <p className="text-[11px] text-gray-500 mt-1 inline-flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {post.scheduledAt ? format(parseISO(post.scheduledAt), "HH:mm") : "--:--"}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto pb-1">
                                        <div className="min-w-[680px]">
                                            <div className="grid grid-cols-7 mb-2">
                                                {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((label) => (
                                                    <div key={label} className="text-center text-xs font-black text-gray-400 uppercase py-2">
                                                        {t(`dashboard.socialPlanner.weekdays.${label}`, { defaultValue: label })}
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
                                                            onDragOver={(event) => handleDayDragOver(event, key)}
                                                            onDrop={(event) => handlePostDropOnDay(event, day)}
                                                            className={`h-20 rounded-xl border-2 p-2 text-left transition-all ${isSelected ? "border-black bg-[#d2e823]/40" : "border-gray-200 bg-white hover:border-black"} ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""} ${dropTargetDateKey === key ? "ring-2 ring-[#C6F035] ring-offset-1 border-black bg-[#C6F035]/20" : ""}`}
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
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5">
                                    <h3 className="text-sm font-black text-[#1A1A1A] mb-2">
                                        {t("dashboard.socialPlanner.dayPosts", { defaultValue: "Posts on selected day" })}
                                    </h3>
                                    {selectedDatePosts.length === 0 ? (
                                        <p className="text-sm text-gray-500">{t("dashboard.socialPlanner.emptyDay", { defaultValue: "No scheduled posts on this day." })}</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedDatePosts.map((post) => (
                                                <div
                                                    key={post.id}
                                                    draggable={canDragPost(post)}
                                                    onDragStart={(event) => handlePostDragStart(event, post.id)}
                                                    onDragEnd={resetDragState}
                                                    className={`p-3 border-2 border-black rounded-xl bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-opacity ${canDragPost(post) ? "cursor-grab active:cursor-grabbing" : "cursor-default"} ${draggingPostId === post.id ? "opacity-60" : "opacity-100"}`}
                                                >
                                                    <div>
                                                        <p className="font-bold text-sm text-[#1A1A1A] capitalize">{post.channel}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{post.content}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {reschedulingPostId === post.id && (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border capitalize ${statusClassMap[post.status]}`}>
                                                            {t(`dashboard.socialPlanner.status.${post.status}`, { defaultValue: post.status })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </>
                )}

                {composerOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setComposerOpen(false)} />
                        <div className="relative w-full max-w-2xl bg-white rounded-t-[24px] sm:rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 max-h-[92vh] overflow-y-auto">
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
                                        {t("dashboard.socialPlanner.fields.media", { defaultValue: "Images" })}
                                    </label>
                                    <div className="mb-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
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

                                    {formData.mediaUrls.length === 0 ? (
                                        <div className="w-full border-2 border-dashed border-gray-300 rounded-xl px-3 py-4 text-sm text-gray-500 font-medium">
                                            {t("dashboard.socialPlanner.emptyMedia", { defaultValue: "No images uploaded yet." })}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {formData.mediaUrls.map((url, index) => (
                                                <div key={`${url}-${index}`} className="w-full border-2 border-black rounded-xl p-2.5 bg-white flex items-center gap-2">
                                                    <img src={url} alt={`media-${index + 1}`} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />

                                                    <p className="text-xs text-gray-600 font-medium truncate flex-1 min-w-0">{url}</p>

                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveMediaItem(index, "up")}
                                                            disabled={index === 0}
                                                            className="p-1.5 border border-black rounded-md hover:bg-gray-50 disabled:opacity-40"
                                                            aria-label={t("dashboard.socialPlanner.actions.moveUp", { defaultValue: "Move up" })}
                                                        >
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveMediaItem(index, "down")}
                                                            disabled={index === formData.mediaUrls.length - 1}
                                                            className="p-1.5 border border-black rounded-md hover:bg-gray-50 disabled:opacity-40"
                                                            aria-label={t("dashboard.socialPlanner.actions.moveDown", { defaultValue: "Move down" })}
                                                        >
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMediaItem(index)}
                                                            className="p-1.5 border border-black rounded-md hover:bg-red-50 text-red-600"
                                                            aria-label={t("dashboard.socialPlanner.actions.removeImage", { defaultValue: "Remove image" })}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
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

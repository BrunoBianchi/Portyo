import type { MetaFunction } from "react-router";
import { useEffect, useState } from "react";
import { Plus, Search, FileText, MoreHorizontal, Calendar, Eye, Filter, Edit2, Trash2 } from "lucide-react";
import { NewPostModal } from "~/components/dashboard/new-post-modal";
import { useBlog } from "~/contexts/blog.context";
import { useTranslation } from "react-i18next";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useJoyrideSettings } from "~/utils/joyride";

export const meta: MetaFunction = () => {
    return [
        { title: "Blog | Portyo" },
        { name: "description", content: "Manage your blog posts." },
    ];
};

export default function DashboardBlog() {
    const { t } = useTranslation();
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const { posts, loading, deletePost } = useBlog();
    const [editingPost, setEditingPost] = useState<any>(null);
    const [postToDelete, setPostToDelete] = useState<any>(null);
    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const hasSeenTour = window.localStorage.getItem("portyo:blog-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, []);

    const blogTourSteps: Step[] = [
        {
            target: "[data-tour=\"blog-header\"]",
            content: t("dashboard.tours.blog.steps.header"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"blog-new\"]",
            content: t("dashboard.tours.blog.steps.newPost"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"blog-toolbar\"]",
            content: t("dashboard.tours.blog.steps.toolbar"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"blog-table\"]",
            content: t("dashboard.tours.blog.steps.table"),
            placement: "top",
        },
        {
            target: "[data-tour=\"blog-row\"]",
            content: t("dashboard.tours.blog.steps.row"),
            placement: "top",
        },
    ];

    const handleBlogTourCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
            const delta = action === ACTIONS.PREV ? -1 : 1;
            setTourStepIndex(index + delta);
            return;
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setTourRun(false);
            setTourStepIndex(0);
            if (typeof window !== "undefined") {
                window.localStorage.setItem("portyo:blog-tour-done", "true");
            }
        }
    };

    const handleEdit = (post: any) => {
        setEditingPost(post);
        setIsNewPostModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsNewPostModalOpen(false);
        setEditingPost(null);
    };

    const handleDeleteClick = (post: any) => {
        setPostToDelete(post);
    };

    const confirmDelete = async () => {
        if (postToDelete) {
            await deletePost(postToDelete.id);
            setPostToDelete(null);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <Joyride
                steps={blogTourSteps}
                run={tourRun}
                stepIndex={tourStepIndex}
                continuous
                showSkipButton
                spotlightClicks
                scrollToFirstStep
                callback={handleBlogTourCallback}
                styles={joyrideStyles}
                scrollOffset={joyrideProps.scrollOffset}
                spotlightPadding={joyrideProps.spotlightPadding}
                disableScrollParentFix={joyrideProps.disableScrollParentFix}
            />
            <NewPostModal
                isOpen={isNewPostModalOpen}
                onClose={handleCloseModal}
                post={editingPost}
            />

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-75" onClick={() => setPostToDelete(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-75" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{t("dashboard.blog.delete.title")}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t("dashboard.blog.delete.body", { title: postToDelete.title })}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPostToDelete(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                {t("dashboard.blog.delete.cancel")}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                {t("dashboard.blog.delete.action")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6" data-tour="blog-header">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                        <FileText className="w-3 h-3" />
                        {t("dashboard.blog.badge")}
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">{t("dashboard.blog.title")}</h1>
                    <p className="text-lg text-text-muted">{t("dashboard.blog.subtitle")}</p>
                </div>
                <button
                    data-tour="blog-new"
                    onClick={() => {
                        setEditingPost(null);
                        setIsNewPostModalOpen(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4" /> {t("dashboard.blog.newPost")}
                </button>
            </header>


            {/* Main Content Card */}
            <div className="card overflow-hidden" data-tour="blog-table">
                {/* Toolbar */}
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-alt/30" data-tour="blog-toolbar">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder={t("dashboard.blog.searchPlaceholder")}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm appearance-none cursor-pointer">
                                <option value="all">{t("dashboard.blog.status.all")}</option>
                                <option value="published">{t("dashboard.blog.status.published")}</option>
                                <option value="draft">{t("dashboard.blog.status.draft")}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-muted border-b border-border text-xs font-bold text-text-muted uppercase tracking-wider">
                    <div className="col-span-6">{t("dashboard.blog.table.post")}</div>
                    <div className="col-span-2">{t("dashboard.blog.table.status")}</div>
                    <div className="col-span-2">{t("dashboard.blog.table.stats")}</div>
                    <div className="col-span-2 text-right">{t("dashboard.blog.table.actions")}</div>
                </div>

                {/* List */}
                <div className="divide-y divide-border">
                    {posts.map((post: any, index: number) => (
                        <div
                            key={post.id}
                            data-tour={index === 0 ? "blog-row" : undefined}
                            className="flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-4 items-start md:items-center hover:bg-surface-alt/50 transition-colors group relative"
                        >
                            {/* Post Info */}
                            <div className="w-full md:col-span-6 flex items-start md:items-center gap-4">
                                <div className="w-20 h-16 md:w-16 md:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-border">
                                    {post.thumbnail ? (
                                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-bold text-text-main truncate group-hover:text-primary-foreground transition-colors line-clamp-2 md:line-clamp-1">{post.title}</h3>
                                    <p className="text-xs text-text-muted truncate mt-0.5">{post.excerpt}</p>

                                    {/* Mobile Stats & Status Inline */}
                                    <div className="flex md:hidden items-center gap-3 mt-2 flex-wrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${post.status === 'published'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {post.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                                            <span className="capitalize">{post.status === 'published' ? t("dashboard.blog.status.published") : t("dashboard.blog.status.draft")}</span>
                                        </span>

                                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                            <Eye className="w-3 h-3" />
                                            <span>{post.views.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Status */}
                            <div className="hidden md:block col-span-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${post.status === 'published'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                    {post.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                                    {post.status === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>}
                                    <span className="capitalize">{post.status === 'published' ? t("dashboard.blog.status.published") : t("dashboard.blog.status.draft")}</span>
                                </span>
                            </div>

                            {/* Desktop Stats */}
                            <div className="hidden md:block col-span-2 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                    <Eye className="w-3 h-3" />
                                    <span>{t("dashboard.blog.views", { count: post.views })}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="w-full md:w-auto md:col-span-2 flex justify-end md:justify-end gap-2 mt-2 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 md:static">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2 text-text-muted hover:text-primary-foreground hover:bg-primary/10 rounded-lg transition-colors bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border md:border-none border-gray-100 shadow-sm md:shadow-none"
                                    title={t("dashboard.blog.actions.edit")}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(post)}
                                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border md:border-none border-gray-100 shadow-sm md:shadow-none"
                                    title={t("dashboard.blog.actions.delete")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Pagination Footer */}
                <div className="px-6 py-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs text-text-muted">
                    <span>{t("dashboard.blog.showing", { count: posts.length })}</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-md border border-border bg-white hover:bg-gray-50 disabled:opacity-50" disabled>{t("dashboard.blog.pagination.previous")}</button>
                        <button className="px-3 py-1 rounded-md border border-border bg-white hover:bg-gray-50 disabled:opacity-50" disabled>{t("dashboard.blog.pagination.next")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

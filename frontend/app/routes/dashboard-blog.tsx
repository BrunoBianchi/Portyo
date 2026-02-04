import type { MetaFunction } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { Plus, Search, FileText, Edit2, Trash2, Calendar, Eye, Filter } from "lucide-react";
import { NewPostModal } from "~/components/dashboard/new-post-modal";
import { useBlog } from "~/contexts/blog.context";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

export const meta: MetaFunction = () => {
    return [
        { title: "Blog | Portyo" },
        { name: "description", content: "Manage your blog posts." },
    ];
};

export default function DashboardBlog() {
    const { t } = useTranslation("dashboard");
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const { posts, loading, deletePost } = useBlog();
    const [editingPost, setEditingPost] = useState<any>(null);
    const [postToDelete, setPostToDelete] = useState<any>(null);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();

    const { startTour } = useDriverTour({
        primaryColor: tourPrimaryColor,
        storageKey: "portyo:blog-tour-done",
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, []);

    // Inicia o tour automaticamente
    useEffect(() => {
        if (isMobile) return;
        if (typeof window === "undefined") return;

        const hasSeenTour = window.localStorage.getItem("portyo:blog-tour-done");
        if (hasSeenTour) return;

        const timer = setTimeout(() => {
            startTour(blogTourSteps);
        }, 1500);

        return () => clearTimeout(timer);
    }, [isMobile, startTour]);

    const blogTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"blog-header\"]",
            popover: {
                title: t("dashboard.tours.blog.steps.headerTitle", "Blog"),
                description: t("dashboard.tours.blog.steps.header"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"blog-new\"]",
            popover: {
                title: t("dashboard.tours.blog.steps.newPostTitle", "Novo Post"),
                description: t("dashboard.tours.blog.steps.newPost"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"blog-toolbar\"]",
            popover: {
                title: t("dashboard.tours.blog.steps.toolbarTitle", "Ferramentas"),
                description: t("dashboard.tours.blog.steps.toolbar"),
                side: "bottom",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"blog-table\"]",
            popover: {
                title: t("dashboard.tours.blog.steps.tableTitle", "Lista de Posts"),
                description: t("dashboard.tours.blog.steps.table"),
                side: "top",
                align: "start",
            },
        },
        {
            element: "[data-tour=\"blog-row\"]",
            popover: {
                title: t("dashboard.tours.blog.steps.rowTitle", "Gerenciar Post"),
                description: t("dashboard.tours.blog.steps.row"),
                side: "top",
                align: "start",
            },
        },
    ], [t]);

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
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
            <NewPostModal
                isOpen={isNewPostModalOpen}
                onClose={handleCloseModal}
                post={editingPost}
            />

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-75" onClick={() => setPostToDelete(null)}>
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-75 border-4 border-black" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.blog.delete.title")}</h3>
                        <p className="text-base text-gray-500 font-medium mb-8">
                            {t("dashboard.blog.delete.body", { title: postToDelete.title })}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPostToDelete(null)}
                                className="flex-1 px-4 py-3.5 rounded-full border-2 border-gray-200 font-bold text-gray-500 hover:border-black hover:text-black hover:bg-white transition-colors"
                            >
                                {t("dashboard.blog.delete.cancel")}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3.5 rounded-full bg-red-600 text-white font-black hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {t("dashboard.blog.delete.action")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-black/5" data-tour="blog-header">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_0px_rgba(198,240,53,1)]">
                        <FileText className="w-3 h-3 text-[#C6F035]" />
                        {t("dashboard.blog.badge")}
                    </div>
                    <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.blog.title")}</h1>
                    <p className="text-xl text-gray-500 font-medium">{t("dashboard.blog.subtitle")}</p>
                </div>
                <button
                    data-tour="blog-new"
                    onClick={() => {
                        setEditingPost(null);
                        setIsNewPostModalOpen(true);
                    }}
                    className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-black text-lg hover:bg-black hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} /> {t("dashboard.blog.newPost")}
                </button>
            </header>


            {/* Main Content */}
            <div className="space-y-6" data-tour="blog-table">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between" data-tour="blog-toolbar">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("dashboard.blog.searchPlaceholder")}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-black focus:ring-0 transition-all text-base font-bold placeholder:font-medium placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-black focus:ring-0 text-sm font-bold appearance-none cursor-pointer">
                                <option value="all">{t("dashboard.blog.status.all")}</option>
                                <option value="published">{t("dashboard.blog.status.published")}</option>
                                <option value="draft">{t("dashboard.blog.status.draft")}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-black text-gray-400 uppercase tracking-wider">
                        <div className="col-span-6">{t("dashboard.blog.table.post")}</div>
                        <div className="col-span-2">{t("dashboard.blog.table.status")}</div>
                        <div className="col-span-2">{t("dashboard.blog.table.stats")}</div>
                        <div className="col-span-2 text-right">{t("dashboard.blog.table.actions")}</div>
                    </div>

                    {posts.map((post: any, index: number) => (
                        <div
                            key={post.id}
                            data-tour={index === 0 ? "blog-row" : undefined}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 items-center bg-white rounded-[20px] border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
                        >
                            {/* Post Info */}
                            <div className="col-span-1 md:col-span-6 flex items-center gap-5">
                                <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-100 group-hover:border-black transition-colors">
                                    {post.thumbnail ? (
                                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                            <FileText className="w-8 h-8 opacity-50" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-[#1A1A1A] truncate tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>{post.title}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide truncate mt-0.5">
                                        {post.excerpt || (post.keywords ? post.keywords.split(',').map((k: string) => `#${k.trim()}`).join(' ') : '')}
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 md:col-span-2 flex md:block">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 ${post.status === 'published'
                                    ? 'bg-[#E5F6E3] text-[#356233] border-[#356233]/20'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                    }`}>
                                    {post.status === 'published' && <span className="w-2 h-2 rounded-full bg-[#356233] mr-2"></span>}
                                    {post.status === 'scheduled' && <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>}
                                    {post.status === 'draft' && <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>}
                                    <span className="capitalize">{post.status === 'published' ? t("dashboard.blog.status.published") : t("dashboard.blog.status.draft")}</span>
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="col-span-1 md:col-span-2 flex gap-4 md:block md:space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{t("dashboard.blog.views", { count: post.views || 0 })}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors font-bold border-2 border-transparent hover:border-black"
                                    title={t("dashboard.blog.actions.edit")}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(post)}
                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors font-bold border-2 border-transparent hover:border-red-200"
                                    title={t("dashboard.blog.actions.delete")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Pagination Footer */}
                <div className="px-6 py-6 border-t-2 border-black/5 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>{t("dashboard.blog.showing", { count: posts.length })}</span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:border-black hover:text-black transition-all disabled:opacity-50 disabled:hover:border-gray-200" disabled>{t("dashboard.blog.pagination.previous")}</button>
                        <button className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:border-black hover:text-black transition-all disabled:opacity-50 disabled:hover:border-gray-200" disabled>{t("dashboard.blog.pagination.next")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

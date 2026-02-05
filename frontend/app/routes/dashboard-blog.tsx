import type { MetaFunction } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { Plus, Search, FileText, Edit2, Trash2, Calendar, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#C6F035"); // Default to Lime for theme consistency
    const isMobile = useIsMobile();

    const { startTour } = useDriverTour({
        primaryColor: tourPrimaryColor,
        storageKey: "portyo:blog-tour-done",
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Force colors for tour to match new theme
        setTourPrimaryColor("#C6F035");
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
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 font-['Manrope']">
            <NewPostModal
                isOpen={isNewPostModalOpen}
                onClose={handleCloseModal}
                post={editingPost}
            />

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-75" onClick={() => setPostToDelete(null)}>
                    <div className="bg-white rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md animate-in zoom-in-95 duration-75 border-2 border-black" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-xl bg-red-100 border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Trash2 className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.blog.delete.title")}</h3>
                        <p className="text-base text-gray-500 font-medium mb-8">
                            {t("dashboard.blog.delete.body", { title: postToDelete.title })}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPostToDelete(null)}
                                className="flex-1 px-4 py-3.5 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:border-black hover:text-black hover:bg-white transition-all uppercase text-sm"
                            >
                                {t("dashboard.blog.delete.cancel")}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3.5 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 border-2 border-black uppercase text-sm"
                            >
                                {t("dashboard.blog.delete.action")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-black" data-tour="blog-header">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black text-white text-xs font-black uppercase tracking-wider mb-4 shadow-[4px_4px_0px_0px_#C6F035]">
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
                    className="px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-black text-sm uppercase tracking-wide hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 border-2 border-black"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} /> {t("dashboard.blog.newPost")}
                </button>
            </header>


            {/* Main Content */}
            <div className="space-y-8" data-tour="blog-table">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between" data-tour="blog-toolbar">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                        <input
                            type="text"
                            placeholder={t("dashboard.blog.searchPlaceholder")}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-base font-bold placeholder:font-medium placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                            <select className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-bold appearance-none cursor-pointer">
                                <option value="all">{t("dashboard.blog.status.all")}</option>
                                <option value="published">{t("dashboard.blog.status.published")}</option>
                                <option value="draft">{t("dashboard.blog.status.draft")}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid gap-6">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-black text-black uppercase tracking-widest opacity-50">
                        <div className="col-span-6">{t("dashboard.blog.table.post")}</div>
                        <div className="col-span-2">{t("dashboard.blog.table.status")}</div>
                        <div className="col-span-2">{t("dashboard.blog.table.stats")}</div>
                        <div className="col-span-2 text-right">{t("dashboard.blog.table.actions")}</div>
                    </div>

                    {posts.map((post: any, index: number) => (
                        <div
                            key={post.id}
                            data-tour={index === 0 ? "blog-row" : undefined}
                            className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 md:px-6 md:py-6 items-center bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 group"
                        >
                            {/* Post Info */}
                            <div className="col-span-1 md:col-span-6 flex items-center gap-5">
                                <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {post.thumbnail ? (
                                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white text-gray-300">
                                            <FileText className="w-8 h-8 opacity-20 text-black" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black text-[#1A1A1A] truncate tracking-tight mb-2 leading-none" style={{ fontFamily: 'var(--font-display)' }}>{post.title}</h3>
                                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-wider truncate mt-0.5 border border-black inline-block px-2 py-0.5 rounded bg-gray-50">
                                        {post.excerpt || (post.keywords ? post.keywords.split(',').map((k: string) => `#${k.trim()}`).join(' ') : 'No Tags')}
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 md:col-span-2 flex md:block">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 ${post.status === 'published'
                                    ? 'bg-[#E5F6E3] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-gray-100 text-gray-400 border-gray-300'
                                    }`}>
                                    {post.status === 'published' && <div className="w-2 h-2 rounded-full bg-green-500 border border-black"></div>}
                                    {post.status === 'scheduled' && <div className="w-2 h-2 rounded-full bg-blue-500 border border-black"></div>}
                                    {post.status === 'draft' && <div className="w-2 h-2 rounded-full bg-gray-400 border border-black"></div>}
                                    <span className="capitalize">{post.status === 'published' ? t("dashboard.blog.status.published") : t("dashboard.blog.status.draft")}</span>
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="col-span-1 md:col-span-2 flex gap-6 md:block md:space-y-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <Calendar className="w-4 h-4 text-black" />
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <Eye className="w-4 h-4 text-black" />
                                    <span>{t("dashboard.blog.views", { count: post.views || 0 })}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2.5 text-black bg-white hover:bg-[#C6F035] rounded-xl transition-all font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                                    title={t("dashboard.blog.actions.edit")}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(post)}
                                    className="p-2.5 text-black bg-white hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                                    title={t("dashboard.blog.actions.delete")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Pagination Footer */}
                <div className="px-6 py-6 border-t-2 border-black flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-b-2xl">
                    <span>{t("dashboard.blog.showing", { count: posts.length })}</span>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

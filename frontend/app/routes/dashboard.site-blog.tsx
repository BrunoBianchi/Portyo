import type { MetaFunction } from "react-router";
import { useState } from "react";
import { Plus, Search, FileText, MoreHorizontal, Calendar, Eye, Filter, Edit2, Trash2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { NewSitePostModal } from "~/components/dashboard/new-site-post-modal";
import { useSiteBlog } from "~/contexts/site-blog.context";
import { format } from "date-fns";

export const meta: MetaFunction = () => {
    return [
        { title: "Site Blog | Portyo Admin" },
        { name: "description", content: "Manage site blog posts." },
    ];
};

export default function DashboardSiteBlog() {
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const { posts, loading, deletePost } = useSiteBlog();
    const [editingPost, setEditingPost] = useState<any>(null);
    const [postToDelete, setPostToDelete] = useState<any>(null);

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
            <NewSitePostModal
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
                        <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>Delete Post?</h3>
                        <p className="text-base text-gray-500 font-medium mb-8">
                            Are you sure you want to delete <span className="text-black font-bold border-b-2 border-[#C6F035]">"{postToDelete.title}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPostToDelete(null)}
                                className="flex-1 px-4 py-3.5 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:border-black hover:text-black hover:bg-white transition-all uppercase text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3.5 rounded-xl bg-red-500 text-white font-black hover:bg-red-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 border-2 border-black uppercase text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-black">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black text-white text-xs font-black uppercase tracking-wider mb-4 shadow-[4px_4px_0px_0px_#C6F035]">
                        <FileText className="w-3 h-3 text-[#C6F035]" />
                        Admin
                    </div>
                    <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>Site Blog</h1>
                    <p className="text-xl text-gray-500 font-medium">Manage your site's blog posts.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        to="/dashboard/site-blog/auto-post"
                        className="px-6 py-3 rounded-xl bg-white text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex items-center gap-2 uppercase text-sm tracking-wide"
                    >
                        <Sparkles className="w-4 h-4" /> Auto Post
                    </Link>
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setIsNewPostModalOpen(true);
                        }}
                        className="px-8 py-3 bg-[#C6F035] text-black rounded-xl font-black text-sm uppercase tracking-wide hover:-translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" strokeWidth={3} /> New Post
                    </button>
                </div>
            </header>


            {/* Main Content */}
            <div className="space-y-8">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-base font-bold placeholder:font-medium placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                            <select className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-bold appearance-none cursor-pointer">
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid gap-6">
                    {/* Header Row (Optional, maybe hidden on mobile) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-black text-black uppercase tracking-widest opacity-50">
                        <div className="col-span-6">Post</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Stats</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {posts.map((post: any) => (
                        <div key={post.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 md:px-6 md:py-6 items-center bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 group">
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
                                    <div className="flex flex-wrap gap-2">
                                        {post.keywords ? post.keywords.split(',').slice(0, 3).map((k: string) => (
                                            <span key={k} className="px-2 py-0.5 rounded border border-black text-[10px] font-bold uppercase bg-gray-50">
                                                #{k.trim()}
                                            </span>
                                        )) : <span className="text-xs text-gray-400 font-bold italic">No keywords</span>}
                                    </div>
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
                                    {post.status}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="col-span-1 md:col-span-2 flex gap-6 md:block md:space-y-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <Calendar className="w-4 h-4 text-black" />
                                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <Eye className="w-4 h-4 text-black" />
                                    <span>{post.views?.toLocaleString() || 0} views</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2.5 text-black bg-white hover:bg-[#C6F035] rounded-xl transition-all font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(post)}
                                    className="p-2.5 text-black bg-white hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Pagination Footer */}
                <div className="px-6 py-6 border-t-2 border-black flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-b-2xl">
                    <span>Showing {posts.length} posts</span>
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

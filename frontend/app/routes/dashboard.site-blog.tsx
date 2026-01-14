import type { MetaFunction } from "react-router";
import { useState } from "react";
import { Plus, Search, FileText, MoreHorizontal, Calendar, Eye, Filter, Edit2, Trash2 } from "lucide-react";
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
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <NewSitePostModal
                isOpen={isNewPostModalOpen}
                onClose={handleCloseModal}
                post={editingPost}
            />

            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-75" onClick={() => setPostToDelete(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-75" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Post?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete "{postToDelete.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPostToDelete(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                        <FileText className="w-3 h-3" />
                        Admin
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">Site Blog</h1>
                    <p className="text-lg text-text-muted">Manage main site's blog posts.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPost(null);
                        setIsNewPostModalOpen(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4" /> New Post
                </button>
            </header>


            {/* Main Content Card */}
            <div className="card overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-alt/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-48">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm appearance-none cursor-pointer">
                                <option value="all">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-muted border-b border-border text-xs font-bold text-text-muted uppercase tracking-wider">
                    <div className="col-span-6">Post</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Stats</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* List */}
                <div className="divide-y divide-border">
                    {posts.map((post: any) => (
                        <div key={post.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-alt/50 transition-colors group">
                            {/* Post Info */}
                            <div className="col-span-6 flex items-center gap-4">
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-border">
                                    {post.thumbnail ? (
                                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-text-main truncate group-hover:text-primary-foreground transition-colors">{post.title}</h3>
                                    <p className="text-xs text-text-muted truncate">
                                        {post.keywords ? post.keywords.split(',').map((k: string) => `#${k.trim()}`).join(' ') : 'No keywords'}
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${post.status === 'published'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                    {post.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                                    {post.status === 'scheduled' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>}
                                    {post.status === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>}
                                    <span className="capitalize">{post.status}</span>
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="col-span-2 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                    <Calendar className="w-3 h-3" />
                                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                    <Eye className="w-3 h-3" />
                                    <span>{post.views?.toLocaleString() || 0} views</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(post)}
                                    className="p-2 text-text-muted hover:text-primary-foreground hover:bg-primary/10 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(post)}
                                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-text-muted hover:text-text-main hover:bg-gray-100 rounded-lg transition-colors" aria-label="More options">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State / Pagination Footer */}
                <div className="px-6 py-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs text-text-muted">
                    <span>Showing {posts.length} posts</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-md border border-border bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded-md border border-border bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

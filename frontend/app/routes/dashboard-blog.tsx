import type { MetaFunction } from "react-router";
import { useState } from "react";
import { Plus, Search, FileText, MoreHorizontal, Calendar, Eye, Filter, Edit2, Trash2 } from "lucide-react";
import { NewPostModal } from "../components/new-post-modal";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog | Portyo" },
    { name: "description", content: "Manage your blog posts." },
  ];
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  status: "published" | "draft";
  date: string;
  views: number;
}

export default function DashboardBlog() {
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "1",
      title: "How to optimize your bio link for conversions",
      excerpt: "Learn the top strategies to turn your followers into customers using your bio link.",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "published",
      date: "Oct 24, 2025",
      views: 1240
    },
    {
      id: "2",
      title: "My journey as a content creator",
      excerpt: "Sharing my personal experiences, ups and downs, and what I learned along the way.",
      image: "https://images.unsplash.com/photo-1499750310159-5b5f226932b7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "published",
      date: "Oct 10, 2025",
      views: 856
    },
    {
      id: "3",
      title: "Top 10 tools for productivity",
      excerpt: "A curated list of the best tools to help you get more done in less time.",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      status: "draft",
      date: "Oct 01, 2025",
      views: 0
    }
  ]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <NewPostModal isOpen={isNewPostModalOpen} onClose={() => setIsNewPostModalOpen(false)} />
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
                  <FileText className="w-3 h-3" />
                  Blog
              </div>
              <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-2">Blog Posts</h1>
              <p className="text-lg text-text-muted">Manage your content and stories.</p>
          </div>
          <button 
            onClick={() => setIsNewPostModalOpen(true)}
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
                    <select className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm appearance-none cursor-pointer">
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
            {posts.map((post) => (
                <div key={post.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-surface-alt/50 transition-colors group">
                    {/* Post Info */}
                    <div className="col-span-6 flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-border">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-text-main truncate group-hover:text-primary-foreground transition-colors">{post.title}</h3>
                            <p className="text-xs text-text-muted truncate">{post.excerpt}</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            post.status === 'published' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                            {post.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                            {post.status === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>}
                            <span className="capitalize">{post.status}</span>
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="col-span-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Calendar className="w-3 h-3" />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Eye className="w-3 h-3" />
                            <span>{post.views.toLocaleString()} views</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-text-muted hover:text-primary-foreground hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

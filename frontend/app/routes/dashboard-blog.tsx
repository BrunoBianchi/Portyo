import type { MetaFunction } from "react-router";
import { useState } from "react";
import { Plus, Search, FileText, MoreVertical, Calendar, Eye, MessageSquare } from "lucide-react";

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Create and manage your content.</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search posts..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-6 group">
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4 md:mt-0">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views} views</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 0 comments</span>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors border border-gray-200">
                    Edit
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

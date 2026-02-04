import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, Plus, ExternalLink, Calendar } from "lucide-react";
import { Link } from "react-router";
import { useBlogPosts } from "~/hooks/use-block-integration";
import type { BlogPost } from "~/services/block-integration.service";

interface BlogPostSelectorProps {
  bioId: string | null;
  selectedPostIds?: string[];
  onSelect: (posts: BlogPost[]) => void;
  maxSelection?: number;
  className?: string;
}

export function BlogPostSelector({
  bioId,
  selectedPostIds = [],
  onSelect,
  maxSelection = 5,
  className = "",
}: BlogPostSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { posts, isLoading, error } = useBlogPosts({ bioId, limit: 20 });
  const [isOpen, setIsOpen] = useState(false);

  const selectedPosts = posts.filter((p) => selectedPostIds.includes(p.id));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const togglePost = (post: BlogPost) => {
    const isSelected = selectedPostIds.includes(post.id);
    let newSelection: BlogPost[];
    
    if (isSelected) {
      newSelection = selectedPosts.filter((p) => p.id !== post.id);
    } else {
      if (selectedPosts.length >= maxSelection) {
        return;
      }
      newSelection = [...selectedPosts, post];
    }
    
    onSelect(newSelection);
  };

  if (isLoading) {
    return (
      <div className={`neo-card p-3 ${className}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`neo-card p-3 border-red-500 ${className}`}>
        <p className="text-sm text-red-600">
          {t("editor.blockIntegration.blog.error")}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`neo-card p-4 text-center ${className}`}>
        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-3">
          {t("editor.blockIntegration.blog.empty")}
        </p>
        <Link
          to="/dashboard/blog"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.blog.create")}
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neo-input w-full flex items-center justify-between gap-3 p-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selectedPosts.length === 0 ? (
            <>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <p className="font-semibold text-sm">
                {t("editor.blockIntegration.blog.select")}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <span className="text-sm font-semibold text-primary-700">
                {selectedPosts.length} {t("editor.blockIntegration.blog.postsSelected")}
              </span>
              <span className="text-xs text-gray-500">
                {t("editor.blockIntegration.blog.max", { max: maxSelection })}
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 neo-card max-h-80 overflow-hidden flex flex-col"
            >
              {/* Header */}
              {selectedPosts.length > 0 && (
                <div className="border-b border-gray-200 p-3 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    {t("editor.blockIntegration.blog.selectedCount", { 
                      count: selectedPosts.length,
                      max: maxSelection 
                    })}
                  </p>
                </div>
              )}

              {/* Posts List */}
              <div className="overflow-auto flex-1 p-2">
                <div className="grid grid-cols-1 gap-2">
                  {posts.map((post) => {
                    const isSelected = selectedPostIds.includes(post.id);
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => togglePost(post)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isSelected
                            ? "bg-primary-100 border-2 border-primary-500"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        }`}
                      >
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {post.title}
                          </p>
                          {post.excerpt && (
                            <p className="text-xs text-gray-500 truncate">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-primary-600"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-2">
                <Link
                  to="/dashboard/blog"
                  className="flex items-center justify-center gap-2 w-full p-3 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("editor.blockIntegration.blog.manage")}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

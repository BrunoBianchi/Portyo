import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, Plus, ExternalLink, Calendar, Check } from "lucide-react";
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
  selectedPostIds,
  onSelect,
  maxSelection,
  className = "",
}: BlogPostSelectorProps) {
  const { t } = useTranslation("dashboard");
  const { posts, isLoading, error } = useBlogPosts({ bioId, limit: 20 });
  const [isOpen, setIsOpen] = useState(false);
  const hasAutoSelectedRef = useRef(false);

  // Local state for immediate UI updates
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  // Sync local state with props when props change
  useEffect(() => {
    if (selectedPostIds !== undefined) {
      setLocalSelectedIds(selectedPostIds);
    }
  }, [selectedPostIds]);

  // Auto-select all posts when they first load and selectedPostIds is undefined (never set)
  useEffect(() => {
    if (posts.length > 0 && selectedPostIds === undefined && !hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;
      const allIds = posts.map(p => p.id);
      setLocalSelectedIds(allIds);
      onSelect(posts);
    }
  }, [posts, selectedPostIds, onSelect]);

  const selectedPosts = posts.filter((p) => localSelectedIds.includes(p.id));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const togglePost = (post: BlogPost) => {
    const isSelected = localSelectedIds.includes(post.id);
    let newIds: string[];
    let newSelection: BlogPost[];

    if (isSelected) {
      // Deselect
      newIds = localSelectedIds.filter((id) => id !== post.id);
      newSelection = selectedPosts.filter((p) => p.id !== post.id);
    } else {
      // Select
      if (maxSelection && selectedPosts.length >= maxSelection) {
        return;
      }
      newIds = [...localSelectedIds, post.id];
      newSelection = [...selectedPosts, post];
    }

    // Update local state immediately for instant UI feedback
    setLocalSelectedIds(newIds);
    // Notify parent for persistence
    onSelect(newSelection);
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex-1 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-red-200 rounded-xl p-4 ${className}`}>
        <p className="text-sm text-red-600">
          {t("editor.blockIntegration.blog.error")}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 text-center ${className}`}>
        <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-600 mb-4">
          {t("editor.blockIntegration.blog.empty")}
        </p>
        <Link
          to="/dashboard/blog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("editor.blockIntegration.blog.create")}
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {t("editor.blockIntegration.blog.select")}
            </p>
            <p className="text-xs text-gray-500">
              {selectedPosts.length} de {posts.length} posts selecionados
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-medium text-gray-700">
                  {selectedPosts.length} de {posts.length} posts selecionados
                </p>
              </div>

              {/* Posts List */}
              <div className="overflow-auto flex-1 p-2">
                <div className="space-y-1">
                  {posts.map((post) => {
                    const isSelected = localSelectedIds.includes(post.id);
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePost(post);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer ${isSelected
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                          }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
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

                        {/* Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                            ? "bg-blue-600"
                            : "bg-white border-2 border-gray-300"
                            }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <Link
                  to="/dashboard/blog"
                  className="flex items-center justify-center gap-2 w-full p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Gerenciar blog
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { XIcon } from "./icons";

interface BlogPostPopupProps {
  post: {
    title: string;
    content: string;
    image?: string;
    date?: string;
    author?: string;
    tags?: string[];
    category?: string;
  };
  onClose: () => void;
  config: {
    style?: "classic" | "modern" | "simple";
    backgroundColor?: string;
    textColor?: string;
    overlayColor?: string;
    font?: string;
  };
}

export const BlogPostPopup: React.FC<BlogPostPopupProps> = ({ post, onClose, config }) => {
  const style = config.style || "classic";
  const bgColor = config.backgroundColor || "#ffffff";
  const textColor = config.textColor || "#1f2937";
  const overlayColor = config.overlayColor || "rgba(0, 0, 0, 0.5)";

  // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const MarkdownContent = () => (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
      <ReactMarkdown
        components={{
          p: ({ ref, ...props }) => <p style={{ color: textColor, opacity: 0.9 }} {...props} />,
          h1: ({ ref, ...props }) => <h1 style={{ color: textColor }} {...props} />,
          h2: ({ ref, ...props }) => <h2 style={{ color: textColor }} {...props} />,
          h3: ({ ref, ...props }) => <h3 style={{ color: textColor }} {...props} />,
          li: ({ ref, ...props }) => <li style={{ color: textColor, opacity: 0.9 }} {...props} />,
          strong: ({ ref, ...props }) => <strong style={{ color: textColor }} {...props} />,
        }}
      >
        {post.content}
      </ReactMarkdown>
    </div>
  );

  const Tags = () => (
    post.tags && post.tags.length > 0 ? (
      <div className="mt-8 pt-6 border-t border-gray-100/20">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, i) => (
            <span key={i} className="text-sm opacity-60">#{tag}</span>
          ))}
        </div>
      </div>
    ) : null
  );

  const CloseButton = ({ className = "" }) => (
    <button
      onClick={onClose}
      className={`absolute p-2 rounded-full hover:bg-black/5 transition-colors z-20 ${className}`}
      style={{ color: textColor }}
    >
      <XIcon width={24} height={24} />
    </button>
  );

  // Modern Layout (Split View)
  if (style === "modern") {
    return typeof document !== 'undefined' ? createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
        style={{ backgroundColor: overlayColor, backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          style={{ backgroundColor: bgColor, color: textColor }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton className="right-4 top-4 md:hidden bg-white/50 backdrop-blur-sm" />

          {/* Left Side - Image & Meta */}
          <div className="w-full md:w-5/12 h-48 md:h-full relative shrink-0">
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                No Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/50" />

            <div className="absolute bottom-0 left-0 p-6 text-white w-full">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                    {post.category}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2 text-shadow-sm">
                {post.title}
              </h1>
              {post.date && (
                <p className="text-sm opacity-90 font-medium">{post.date}</p>
              )}
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 h-full overflow-y-auto p-6 md:p-10 relative">
            <CloseButton className="hidden md:block right-6 top-6" />

            {post.author && (
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100/10">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 shrink-0">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold opacity-90">Written by {post.author}</p>
                </div>
              </div>
            )}

            <MarkdownContent />
            <Tags />
          </div>
        </div>
      </div>, document.body) : null;
  }

  // Simple Layout (Minimalist, No Header Image)
  if (style === "simple") {
    return typeof document !== 'undefined' ? createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        style={{ backgroundColor: overlayColor, backdropFilter: "blur(2px)" }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl border border-gray-100"
          style={{ backgroundColor: bgColor, color: textColor }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton className="right-4 top-4" />

          <div className="p-8 sm:p-12">
            <div className="text-center mb-10">
              {post.category && (
                <span className="text-xs font-bold tracking-widest uppercase opacity-50 mb-3 block">
                  {post.category}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-serif font-medium mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm opacity-60">
                {post.date && <span>{post.date}</span>}
                {post.author && (
                  <>
                    <span>•</span>
                    <span>{post.author}</span>
                  </>
                )}
              </div>
            </div>

            <MarkdownContent />
            <Tags />
          </div>
        </div>
      </div>, document.body) : null;
  }

  // Classic Layout (Default)
  return typeof document !== 'undefined' ? createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: overlayColor, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor: bgColor, color: textColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton className="right-4 top-4 bg-white/10 backdrop-blur-sm" />

        {post.image && (
          <div className="w-full h-64 sm:h-80 relative">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight text-shadow-md">
                {post.title}
              </h1>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-10">
          {!post.image && (
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100/20 text-sm opacity-80">
            {post.category && (
              <span className="px-3 py-1 rounded-full bg-black/5 font-medium">
                {post.category}
              </span>
            )}
            {post.date && <span>{post.date}</span>}
            {post.author && <span>By {post.author}</span>}
          </div>

          <MarkdownContent />
          <Tags />
        </div>
      </div>
    </div>, document.body) : null;
};

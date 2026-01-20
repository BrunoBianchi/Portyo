
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api } from "../services/api";
import { format } from "date-fns";
import { ArrowLeft, Share2, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { sanitizeHtml } from "~/utils/security";
import { useTranslation } from "react-i18next";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    views?: number;
    thumbnail?: string;
    bio?: {
        id: string;
        sufix: string;
        profileImage?: string;
        seoTitle?: string;
    };
    user?: {
        id: string;
        name?: string;
    };
}

export default function BlogPostPage() {
    const { postId } = useParams();
    const { i18n } = useTranslation();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!postId) {
            setError("Post not found");
            setLoading(false);
            return;
        }
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/public/blog/post/${postId}`);
            setPost(res.data);

            if (res.data?.title) {
                document.title = `${res.data.title} | ${res.data.bio?.seoTitle || res.data.bio?.sufix || 'Blog'}`;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title,
                    url: url
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    const getReadTime = (content: string) => {
        const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-alt">
                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-alt">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600 mb-6 font-serif italic">Post not found</p>
                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Return Home
                </Link>
            </div>
        );
    }

    const authorName = "Portyo.me";
    const authorImage = post.bio?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=f3f4f6&color=000`;
    const readTime = getReadTime(post.content);
    const formattedDate = format(new Date(post.createdAt), 'MMMM d, yyyy');
    const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content || "");

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <article className="min-h-screen bg-surface-alt">
            {/* Minimalist Navigation */}
            <nav className="border-b border-gray-100 sticky top-0 bg-surface-alt/95 backdrop-blur-sm z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        to={`/${i18n.language}/blog`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to Blog</span>
                    </Link>

                    <button
                        onClick={handleShare}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            <motion.div
                className="max-w-3xl mx-auto px-6 py-12 md:py-20"
                initial="hidden"
                animate="visible"
            >
                {/* Editorial Header */}
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-xs font-bold tracking-widest text-gray-400 uppercase mb-6">
                        <span suppressHydrationWarning>{formattedDate}</span>
                        <span>•</span>
                        <span suppressHydrationWarning>{readTime} min read</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-3">
                        <img
                            src={authorImage}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
                        />
                        <div className="text-left">
                            <p className="text-sm font-bold text-gray-900">{authorName}</p>
                            <p className="text-xs text-gray-500 font-medium">Author & Creator</p>
                        </div>
                    </div>
                </header>

                {/* Featured Image - Clean & Sharp */}
                {post.thumbnail && (
                    <div className="mb-16 -mx-6 md:-mx-12">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-auto shadow-sm"
                        />
                        <div className="mt-2 text-center">
                            <span className="text-xs text-gray-400 font-medium">Featured Image</span>
                        </div>
                    </div>
                )}

                {/* Content - High Readability */}
                <div className="blog-markdown font-sans">
                    {isHtmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
                    ) : (
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    )}
                </div>

                {/* Footer Section */}
                <div className="mt-24 pt-12 border-t border-gray-100">
                    <div className="text-center">
                        <div className="inline-block p-4 border border-black rounded-full mb-8">
                            <h3 className="font-bold text-xl px-4">The End.</h3>
                        </div>
                        <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                            Thanks for reading. If you enjoyed this piece, please consider sharing it with your network.
                        </p>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .blog-markdown {
                    font-size: 1.05rem;
                    line-height: 1.9;
                    color: #111827;
                }
                .blog-markdown > * + * { margin-top: 1.25rem; }
                .blog-markdown h1 { font-size: 2.25rem; line-height: 1.2; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; }
                .blog-markdown h2 { font-size: 1.75rem; line-height: 1.3; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
                .blog-markdown h3 { font-size: 1.4rem; line-height: 1.35; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.5rem; }
                .blog-markdown h4 { font-size: 1.15rem; line-height: 1.4; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .blog-markdown p { margin: 0 0 1rem; white-space: pre-wrap; }
                .blog-markdown a { color: #1d4ed8; text-decoration: underline; text-underline-offset: 3px; }
                .blog-markdown a:hover { color: #1e40af; }
                .blog-markdown ul, .blog-markdown ol { margin: 0 0 1rem; padding-left: 1.5rem; }
                .blog-markdown li { margin: 0.4rem 0; }
                .blog-markdown blockquote {
                    border-left: 4px solid #e5e7eb;
                    background: #f9fafb;
                    color: #374151;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    margin: 1.5rem 0;
                }
                .blog-markdown code {
                    background: #f3f4f6;
                    padding: 0.15rem 0.4rem;
                    border-radius: 0.4rem;
                    font-size: 0.95em;
                }
                .blog-markdown pre {
                    background: #0b1020;
                    color: #e5e7eb;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                }
                .blog-markdown pre code { background: none; padding: 0; color: inherit; }
                .blog-markdown img {
                    max-width: 100%;
                    border-radius: 12px;
                    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
                    margin: 1.5rem 0;
                }
                .blog-markdown hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
                .blog-markdown table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
                .blog-markdown th, .blog-markdown td { border: 1px solid #e5e7eb; padding: 0.6rem 0.75rem; }
                .blog-markdown th { background: #f9fafb; text-align: left; }
            `}</style>
        </article>
    );
}

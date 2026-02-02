import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api } from "../services/api";
import { format } from "date-fns";
import { ArrowLeft, Share2, Clock, Calendar, Eye } from "lucide-react";
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
    const { t, i18n } = useTranslation("blogPage");
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

            if (res.data?.title && typeof document !== "undefined") {
                document.title = `${res.data.title} | Blog`;
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
            alert(t("linkCopied", "Link copied to clipboard!"));
        }
    };

    const getReadTime = (content: string) => {
        const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    // Remove o H1 do conteúdo markdown para evitar duplicação do título
    const removeFirstH1 = (content: string) => {
        return content.replace(/^#\s+.+\n?/m, '');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <span className="text-3xl font-bold text-muted-foreground">404</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {t("notFound.title", "Post not found")}
                </h1>
                <p className="text-muted-foreground mb-8">{t("notFound.description", "The post you're looking for doesn't exist.")}</p>
                <Link
                    to={`/${i18n.language}/blog`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("backToBlog", "Back to Blog")}
                </Link>
            </div>
        );
    }

    const authorName = post.bio?.seoTitle || post.user?.name || "Portyo.me";
    const authorImage = post.bio?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=bbff00&color=000`;
    const readTime = getReadTime(post.content);
    const formattedDate = format(new Date(post.createdAt), 'MMMM d, yyyy');
    const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content || "");

    // Processa o conteúdo removendo o H1 inicial
    const processedContent = isHtmlContent ? post.content : removeFirstH1(post.content);

    return (
        <article className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-md z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        to={`/${i18n.language}/blog`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">{t("backToBlog", "Back to Blog")}</span>
                    </Link>

                    <button
                        onClick={handleShare}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
                        title={t("share", "Share")}
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
                
                <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-12">
                    {/* Meta info */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6"
                    >
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            {t("readTime", { count: readTime })}
                        </span>
                        {post.views !== undefined && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                <Eye className="w-3.5 h-3.5" />
                                {post.views.toLocaleString()} {t("views", "views")}
                            </span>
                        )}
                    </motion.div>

                    {/* Title */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-8 tracking-tight"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        {post.title}
                    </motion.h1>

                    {/* Author */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center gap-3"
                    >
                        <img
                            src={authorImage}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                        />
                        <div>
                            <p className="text-sm font-semibold text-foreground">{authorName}</p>
                            <p className="text-xs text-muted-foreground">{t("author.role", "Author")}</p>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Featured Image */}
            {post.thumbnail && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="max-w-5xl mx-auto px-6 mb-12"
                >
                    <div className="relative overflow-hidden rounded-2xl">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-auto max-h-[500px] object-cover"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
                    </div>
                </motion.div>
            )}

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 pb-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="blog-post-content"
                >
                    {isHtmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(processedContent) }} />
                    ) : (
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-lg md:text-xl font-semibold text-foreground mt-6 mb-2">
                                        {children}
                                    </h3>
                                ),
                                h4: ({ children }) => (
                                    <h4 className="text-base md:text-lg font-semibold text-foreground mt-5 mb-2">
                                        {children}
                                    </h4>
                                ),
                                p: ({ children }) => (
                                    <p className="text-base text-muted-foreground leading-7 mb-5">
                                        {children}
                                    </p>
                                ),
                                a: ({ href, children }) => (
                                    <a 
                                        href={href} 
                                        className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {children}
                                    </a>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc pl-5 space-y-2 mb-5 text-muted-foreground">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal pl-5 space-y-2 mb-5 text-muted-foreground">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="text-muted-foreground leading-7">
                                        {children}
                                    </li>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary/50 pl-5 py-3 my-6 bg-muted/50 rounded-r-lg">
                                        <p className="text-foreground italic m-0">{children}</p>
                                    </blockquote>
                                ),
                                code: ({ children, className }) => {
                                    const isInline = !className;
                                    return isInline ? (
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">
                                            {children}
                                        </code>
                                    ) : (
                                        <pre className="bg-muted p-4 rounded-xl overflow-x-auto mb-5 border border-border">
                                            <code className={`text-sm text-foreground font-mono ${className || ''}`}>
                                                {children}
                                            </code>
                                        </pre>
                                    );
                                },
                                hr: () => <hr className="border-border my-8" />,
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-6">
                                        <table className="w-full border-collapse border border-border text-sm">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-muted">
                                        {children}
                                    </thead>
                                ),
                                tbody: ({ children }) => (
                                    <tbody>
                                        {children}
                                    </tbody>
                                ),
                                tr: ({ children }) => (
                                    <tr className="border-b border-border">
                                        {children}
                                    </tr>
                                ),
                                th: ({ children }) => (
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {children}
                                    </td>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-semibold text-foreground">
                                        {children}
                                    </strong>
                                ),
                                em: ({ children }) => (
                                    <em className="italic text-muted-foreground">
                                        {children}
                                    </em>
                                ),
                            }}
                        >
                            {processedContent}
                        </ReactMarkdown>
                    )}
                </motion.div>

                {/* Footer Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-16 pt-10 border-t border-border/50"
                >
                    <div className="text-center">
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {t("thanksReading", "Thanks for reading! If you enjoyed this article, consider sharing it.")}
                        </p>
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-semibold rounded-xl hover:bg-primary-hover transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            {t("shareArticle", "Share this article")}
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Custom styles */}
            <style>{`
                .blog-post-content h1,
                .blog-post-content h2,
                .blog-post-content h3,
                .blog-post-content h4 {
                    scroll-margin-top: 80px;
                }
                
                .blog-post-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    margin: 1.5rem 0;
                }
                
                .blog-post-content pre {
                    background: hsl(var(--muted));
                }
                
                .blog-post-content code {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                }
                
                .blog-post-content blockquote > p {
                    margin: 0;
                }
            `}</style>
        </article>
    );
}

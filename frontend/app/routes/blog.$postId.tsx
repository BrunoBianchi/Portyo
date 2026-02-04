import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api } from "../services/api";
import { format } from "date-fns";
import { ArrowLeft, Share2, Clock, Calendar, Eye } from "lucide-react";
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

    const removeFirstH1 = (content: string) => {
        return content.replace(/^#\s+.+\n?/m, '');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F3F3F1]">
                <div className="w-8 h-8 border-4 border-[#1A1A1A] border-t-[#D2E823] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F3F3F1]">
                <h1 className="text-9xl font-black text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-display)' }}>404</h1>
                <p className="text-2xl font-bold text-[#1A1A1A]/60 mb-8">{t("notFound.title", "Post not found")}</p>
                <Link
                    to={`/${i18n.language}/blog`}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A1A1A] text-white font-black text-lg uppercase tracking-wider hover:scale-105 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t("backToBlog", "Back to Blog")}
                </Link>
            </div>
        );
    }

    const authorName = post.bio?.seoTitle || post.user?.name || "Portyo.me";
    const authorImage = post.bio?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1A1A1A&color=fff`;
    const readTime = getReadTime(post.content);
    const formattedDate = format(new Date(post.createdAt), 'MMMM d, yyyy');
    const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content || "");
    const processedContent = isHtmlContent ? post.content : removeFirstH1(post.content);

    return (
        <article className="min-h-screen bg-[#F3F3F1] pb-20">
            {/* Navbar Stub */}
            <div className="sticky top-0 z-50 bg-[#F3F3F1]/90 backdrop-blur-md border-b-2 border-[#1A1A1A]">
                <div className="max-w-[1000px] mx-auto px-6 h-20 flex items-center justify-between">
                    <Link
                        to={`/${i18n.language}/blog`}
                        className="font-bold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-4 py-2 transition-colors uppercase tracking-wider text-sm border-2 border-[#1A1A1A]"
                    >
                        ← {t("backToBlog", "Back")}
                    </Link>
                    <button onClick={handleShare} className="p-3 hover:bg-[#1A1A1A] hover:text-white transition-colors border-2 border-[#1A1A1A] rounded-full">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <header className="max-w-[1000px] mx-auto px-6 pt-16 pb-12">
                <div className="flex flex-wrap gap-4 mb-8 text-sm font-bold text-[#1A1A1A]">
                    <span className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#1A1A1A]">
                        <Calendar className="w-4 h-4" /> {formattedDate}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-[#D2E823] border-2 border-[#1A1A1A]">
                        <Clock className="w-4 h-4" /> {readTime} min read
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black text-[#1A1A1A] leading-[1] mb-12 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                    {post.title}
                </h1>

                <div className="flex items-center gap-4 p-4 border-l-4 border-[#1A1A1A] bg-white">
                    <img
                        src={authorImage}
                        alt={authorName}
                        className="w-12 h-12 rounded-full border-2 border-[#1A1A1A]"
                    />
                    <div>
                        <p className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm">WRITTEN BY</p>
                        <p className="font-black text-xl text-[#1A1A1A]">{authorName}</p>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            {post.thumbnail && (
                <div className="max-w-[1200px] mx-auto px-6 mb-16">
                    <div className="aspect-[21/9] w-full border-2 border-[#1A1A1A] bg-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="max-w-[800px] mx-auto px-6 blog-content text-[#1A1A1A]">
                {isHtmlContent ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(processedContent) }} />
                ) : (
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1 className="text-4xl font-black mt-12 mb-6 tracking-tight">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-3xl font-black mt-10 mb-5 tracking-tight border-b-4 border-[#D2E823] inline-block pr-8">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-2xl font-bold mt-8 mb-4">{children}</h3>,
                            p: ({ children }) => <p className="text-lg leading-relaxed mb-6 font-medium text-[#1A1A1A]/80">{children}</p>,
                            a: ({ href, children }) => <a href={href} className="bg-[#D2E823] px-1 text-[#1A1A1A] font-bold hover:bg-[#1A1A1A] hover:text-[#D2E823] transition-colors" target="_blank" rel="noopener">{children}</a>,
                            ul: ({ children }) => <ul className="list-square pl-6 mb-6 space-y-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 font-bold">{children}</ol>,
                            li: ({ children }) => <li className="pl-2">{children}</li>,
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-[6px] border-[#1A1A1A] pl-6 py-4 my-8 bg-white text-xl font-bold italic">
                                    "{children}"
                                </blockquote>
                            ),
                            code: ({ children, className }) => {
                                const isInline = !className;
                                return isInline ? (
                                    <code className="bg-[#1A1A1A] text-[#D2E823] px-1.5 py-0.5 rounded text-sm font-mono font-bold">
                                        {children}
                                    </code>
                                ) : (
                                    <pre className="bg-[#1A1A1A] text-white p-6 rounded-none overflow-x-auto mb-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#D2E823]">
                                        <code className={`text-sm font-mono ${className || ''}`}>{children}</code>
                                    </pre>
                                );
                            },
                            img: ({ src, alt }) => (
                                <div className="my-8 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                                    <img src={src} alt={alt} className="w-full h-auto block" />
                                    {alt && <div className="bg-white p-2 border-t-2 border-[#1A1A1A] text-xs font-bold text-center uppercase tracking-widest text-[#1A1A1A]/60">{alt}</div>}
                                </div>
                            )
                        }}
                    >
                        {processedContent}
                    </ReactMarkdown>
                )}
            </main>

            <style>{`
                .list-square {
                    list-style-type: square;
                }
                .blog-content strong {
                    font-weight: 900;
                    color: #1A1A1A;
                }
            `}</style>
        </article>
    );
}

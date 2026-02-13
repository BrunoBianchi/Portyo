
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getPublicSitePost, type SitePost } from "~/services/site-blog.service";
import { format } from "date-fns";
import { ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { sanitizeHtml } from "~/utils/security";
import { useTranslation } from "react-i18next";
import type { MetaFunction } from "react-router";

// Meta tags dinâmicos para SEO
export const meta: MetaFunction = ({ params }) => {
    // O conteúdo real será atualizado pelo client-side
    // Mas já definimos meta tags base para SEO
    const lang = params?.lang === "pt" ? "pt" : "en";
    const title = lang === "pt" 
        ? "Artigo do Blog | Portyo"
        : "Blog Article | Portyo";
    const description = lang === "pt"
        ? "Leia artigos exclusivos sobre estratégias para criadores digitais"
        : "Read exclusive articles about strategies for digital creators";
    
    return [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "https://portyo.me/og-image.jpg" },
        { property: "og:site_name", content: "Portyo" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
    ];
};

export default function SiteBlogPostPage() {
    const { id } = useParams();
    const { i18n, t } = useTranslation("blogPage");
    const [post, setPost] = useState<SitePost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) {
            setError("Post not found");
            setLoading(false);
            return;
        }

        const lang = i18n.language === "pt" ? "pt" : "en";
        getPublicSitePost(id, lang).then(fetchedPost => {
            if (fetchedPost) {
                setPost(fetchedPost);
                // Update document title and meta dynamically for SEO
                document.title = `${fetchedPost.title} | Portyo Blog`;
                
                // Update meta description
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    const excerpt = fetchedPost.content?.replace(/<[^>]*>/g, '').substring(0, 160) + '...' || '';
                    metaDesc.setAttribute('content', excerpt);
                }
                
                // Update OG tags
                const ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle) ogTitle.setAttribute('content', fetchedPost.title);
                
                const ogDesc = document.querySelector('meta[property="og:description"]');
                if (ogDesc) {
                    const excerpt = fetchedPost.content?.replace(/<[^>]*>/g, '').substring(0, 160) + '...' || '';
                    ogDesc.setAttribute('content', excerpt);
                }
                
                const ogImage = document.querySelector('meta[property="og:image"]');
                if (ogImage && fetchedPost.thumbnail) {
                    ogImage.setAttribute('content', fetchedPost.thumbnail);
                }
            } else {
                setError("Post not found");
            }
            setLoading(false);
        }).catch(() => {
            setError("Failed to load post");
            setLoading(false);
        });
    }, [id, i18n.language]);

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
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-alt">
                <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-alt text-foreground">
                <h1 className="text-3xl font-serif font-bold mb-2">404</h1>
                <p className="text-muted-foreground mb-6 font-serif italic">Post not found</p>
                <Link
                    to={`/${i18n.language === "pt" ? "pt" : "en"}/blog`}
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:underline transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blog
                </Link>
            </div>
        );
    }

    const authorName = "Portyo Team";
    const authorImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=000&color=fff`;
    const readTime = getReadTime(post.content);
    const formattedDate = format(new Date(post.createdAt), 'MMMM d, yyyy');
    const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(post.content || "");

    return (
        <article className="min-h-screen bg-surface-alt text-foreground pt-20 md:pt-24">
            <motion.div
                className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-12 md:pt-10 md:pb-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Inline Actions (avoid overlapping fixed navbar) */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to={`/${i18n.language === "pt" ? "pt" : "en"}/blog`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to Blog</span>
                    </Link>
                    <button
                        onClick={handleShare}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Editorial Header */}
                <header className="mb-10 md:mb-12 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold tracking-widest text-muted-foreground uppercase mb-5 md:mb-6">
                        <span suppressHydrationWarning>{formattedDate}</span>
                        <span>•</span>
                        <span suppressHydrationWarning>{readTime} min read</span>
                        <span>•</span>
                        <span suppressHydrationWarning>{t("views", { count: post.views ?? 0 })}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground leading-[1.08] mb-7 md:mb-8 tracking-tight break-words">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-3">
                        <img
                            src={authorImage}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover transition-all"
                        />
                        <div className="text-left">
                            <p className="text-sm font-bold text-foreground">{authorName}</p>
                            <p className="text-xs text-muted-foreground font-medium">Official Blog</p>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {post.thumbnail && (
                    <div className="mb-16 -mx-6 md:-mx-12">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-auto shadow-sm rounded-lg"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="blog-markdown font-sans">
                    {isHtmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
                    ) : (
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    )}
                </div>

                {/* Footer Section */}
                <div className="mt-24 pt-12 border-t border-border">
                    <div className="text-center">
                        <div className="inline-block p-4 border border-border rounded-full mb-8">
                            <h3 className="font-bold text-xl px-4 text-foreground">The End.</h3>
                        </div>
                        <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
                            Thanks for reading. If you enjoyed this piece, please consider sharing it.
                        </p>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .blog-markdown {
                    font-size: 1rem;
                    line-height: 1.85;
                    color: #1a1a1a;
                }
                .blog-markdown > * + * { margin-top: 1.25rem; }
                .blog-markdown h1 { font-size: 2rem; line-height: 1.2; font-weight: 800; margin-top: 2.25rem; margin-bottom: 0.9rem; color: #1a1a1a; }
                .blog-markdown h2 { font-size: 1.6rem; line-height: 1.3; font-weight: 800; margin-top: 1.9rem; margin-bottom: 0.7rem; color: #1a1a1a; }
                .blog-markdown h3 { font-size: 1.35rem; line-height: 1.35; font-weight: 700; margin-top: 1.7rem; margin-bottom: 0.5rem; color: #1a1a1a; }
                .blog-markdown h4 { font-size: 1.1rem; line-height: 1.4; font-weight: 700; margin-top: 1.4rem; margin-bottom: 0.5rem; color: #1a1a1a; }
                .blog-markdown p { margin: 0 0 1rem; white-space: pre-wrap; }
                .blog-markdown a { color: #1a1a1a; text-decoration: underline; text-underline-offset: 3px; font-weight: 700; }
                .blog-markdown a:hover { color: #0047ff; }
                .blog-markdown ul, .blog-markdown ol { margin: 0 0 1rem; padding-left: 1.5rem; }
                .blog-markdown li { margin: 0.4rem 0; }
                .blog-markdown blockquote {
                    border-left: 4px solid #1a1a1a;
                    background: #f3f3f1;
                    color: #1a1a1a;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    margin: 1.5rem 0;
                }
                .blog-markdown code {
                    background: #1a1a1a;
                    color: #d2e823;
                    padding: 0.15rem 0.4rem;
                    border-radius: 0.4rem;
                    font-size: 0.95em;
                }
                .blog-markdown pre {
                    background: #1a1a1a;
                    color: #f3f3f1;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                }
                .blog-markdown pre code { background: none; padding: 0; color: inherit; }
                .blog-markdown img {
                    max-width: 100%;
                    border-radius: 12px;
                    box-shadow: 0 10px 24px rgba(26, 26, 26, 0.12);
                    margin: 1.5rem 0;
                }
                .blog-markdown hr { border: none; border-top: 1px solid rgba(26, 26, 26, 0.2); margin: 2rem 0; }
                .blog-markdown table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
                .blog-markdown th, .blog-markdown td { border: 1px solid rgba(26, 26, 26, 0.18); padding: 0.6rem 0.75rem; }
                .blog-markdown th { background: #f3f3f1; text-align: left; }

                @media (max-width: 640px) {
                    .blog-markdown {
                        font-size: 0.96rem;
                        line-height: 1.75;
                    }
                    .blog-markdown h1 { font-size: 1.65rem; margin-top: 1.8rem; }
                    .blog-markdown h2 { font-size: 1.35rem; margin-top: 1.55rem; }
                    .blog-markdown h3 { font-size: 1.15rem; margin-top: 1.35rem; }
                    .blog-markdown h4 { font-size: 1rem; margin-top: 1.15rem; }
                    .blog-markdown table { font-size: 0.88rem; }
                }
            `}</style>
        </article>
    );
}

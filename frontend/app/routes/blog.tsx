import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { getPublicSitePosts, type SitePost } from "~/services/site-blog.service";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";

export function meta() {
    return [{ title: "Portyo Blog" }];
}

// Dark theme card styles
const cardStyles = [
    {
        bg: "bg-gradient-to-br from-primary/20 to-primary/5",
        textColor: "text-foreground",
        titleColor: "text-primary",
        borderColor: "border-primary/30",
        type: "gradient",
    },
    {
        bg: "bg-gradient-to-br from-accent-purple/20 to-accent-purple/5",
        textColor: "text-foreground",
        titleColor: "text-accent-purple",
        borderColor: "border-accent-purple/30",
        type: "gradient-purple",
    },
    {
        bg: "bg-gradient-to-br from-accent-blue/20 to-accent-blue/5",
        textColor: "text-foreground",
        titleColor: "text-accent-blue",
        borderColor: "border-accent-blue/30",
        type: "gradient-blue",
    },
    {
        bg: "bg-surface-card",
        textColor: "text-foreground",
        titleColor: "text-foreground",
        borderColor: "border-border",
        type: "card",
    },
];

// Calculate estimated reading time
function getReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const textOnly = content.replace(/<[^>]*>/g, "");
    const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function getExcerpt(content: string, maxChars = 150): string {
    const textOnly = content.replace(/<[^>]*>/g, "").trim();
    if (textOnly.length <= maxChars) return textOnly;
    return `${textOnly.slice(0, maxChars).trimEnd()}...`;
}

export default function BlogIndex() {
    const { t, i18n } = useTranslation("blogPage");
    const [posts, setPosts] = useState<SitePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
    const cardRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const lang = i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en";
        getPublicSitePosts(lang).then((data) => {
            setPosts(data || []);
            setLoading(false);
        });
    }, [i18n.language, i18n.resolvedLanguage]);

    // Intersection Observer for staggered entrance animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"));
                        setTimeout(() => {
                            setVisibleCards((prev) => new Set([...prev, index]));
                        }, index * 100);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "50px" }
        );

        cardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [posts]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Header */}
            <section className="relative py-20 md:py-28 overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-border text-sm font-semibold text-primary mb-6">
                            <Calendar className="w-4 h-4" />
                            {t("badge", "Our Blog")}
                        </span>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            {t("title", "Insights & Stories")}
                        </h1>
                        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                            {t("subtitle", "Discover tips, strategies, and stories to help you grow your online presence.")}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                {posts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-2xl border border-border bg-surface-card p-12 text-center text-muted-foreground"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                        {t("empty", "No posts yet. Check back soon!")}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, index) => {
                            const style = cardStyles[index % cardStyles.length];
                            const readingTime = post.content ? getReadingTime(post.content) : 2;
                            const isVisible = visibleCards.has(index);
                            const category = post.keywords?.[0] || t("categoryFallback", "Article");
                            const hasThumbnail = Boolean(post.thumbnail);
                            const excerpt = post.content ? getExcerpt(post.content, 120) : "";

                            return (
                                <Link
                                    key={post.id}
                                    to={`/${i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en"}/blog/${post.slug || post.id}`}
                                    ref={(el) => { cardRefs.current[index] = el; }}
                                    data-index={index}
                                    className={`
                                        group block rounded-2xl overflow-hidden
                                        transform transition-all duration-500 ease-out
                                        hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10
                                        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                                    `}
                                    style={{
                                        transitionDelay: `${index * 50}ms`,
                                    }}
                                >
                                    {/* Card Content */}
                                    <div
                                        className={`
                                            ${style.bg} rounded-2xl overflow-hidden relative
                                            border ${style.borderColor}
                                            transition-all duration-300
                                            aspect-[4/3] min-h-[240px]
                                            ${hasThumbnail ? "bg-cover bg-center" : ""}
                                        `}
                                        style={
                                            hasThumbnail
                                                ? { backgroundImage: `url(${post.thumbnail})` }
                                                : undefined
                                        }
                                    >
                                        {/* Overlay for images */}
                                        {hasThumbnail && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                                        )}

                                        {/* Content */}
                                        <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                            {/* Top: Category & Meta */}
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-background">
                                                    {category}
                                                </span>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {t("readTime", { count: readingTime })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bottom: Title & Excerpt */}
                                            <div>
                                                <h3 className={`text-xl font-bold leading-tight mb-2 ${style.titleColor} group-hover:underline decoration-2 underline-offset-4`}>
                                                    {post.title}
                                                </h3>
                                                {excerpt && !hasThumbnail && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        <ReactMarkdown
                                                            skipHtml
                                                            allowedElements={["p", "strong", "em", "a", "code", "span", "br"]}
                                                            components={{
                                                                p: ({ children }) => <span>{children}</span>,
                                                            }}
                                                        >
                                                            {excerpt}
                                                        </ReactMarkdown>
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-3 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span>{t("readMore", "Read more")}</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

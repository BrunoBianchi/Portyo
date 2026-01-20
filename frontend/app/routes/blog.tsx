import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { getPublicSitePosts, type SitePost } from "~/services/site-blog.service";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

export function meta() {
    return [{ title: "Portyo Blog" }];
}

// Color palette inspired by Handshake
const cardStyles = [
    {
        bg: "bg-[#1A3B38]",
        textColor: "text-white",
        titleColor: "text-[#D4EE72]",
        type: "overlay", // Text overlays on colored background
    },
    {
        bg: "bg-gradient-to-br from-[#B4E4FF] via-[#E8D8F0] to-[#D4EE72]",
        textColor: "text-gray-900",
        titleColor: "text-gray-900",
        type: "image", // Image with text below
    },
    {
        bg: "bg-[#E8D8F0]",
        textColor: "text-gray-800",
        titleColor: "text-gray-900",
        type: "centered", // Centered content
    },
    {
        bg: "bg-gradient-to-br from-[#B4E4FF] to-[#E8D8F0]",
        textColor: "text-gray-800",
        titleColor: "text-gray-900",
        type: "gradient", // Gradient background
    },
    {
        bg: "bg-[#D4EE72]",
        textColor: "text-gray-800",
        titleColor: "text-gray-900",
        type: "highlight", // Lime highlight
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
                        }, index * 100); // Stagger by 100ms per card
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
            <div className="min-h-screen flex items-center justify-center bg-[#FDFDF3]">
                <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen ">
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                        {t("title")}
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                        {t("subtitle")}
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                        {t("empty")}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {posts.map((post, index) => {
                            const style = cardStyles[index % cardStyles.length];
                            const readingTime = post.content ? getReadingTime(post.content) : 2;
                            const isVisible = visibleCards.has(index);
                            const category = post.keywords?.[0] || t("categoryFallback");
                            const hasThumbnail = Boolean(post.thumbnail);
                            const excerpt = post.content ? getExcerpt(post.content, 150) : "";

                            return (
                                <Link
                                    key={post.id}
                                    to={`/${i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en"}/blog/${post.id}`}
                                    ref={(el) => { cardRefs.current[index] = el; }}
                                    data-index={index}
                                    className={`
                                        group block rounded-[12px] overflow-hidden p-4
                                        transform transition-all duration-500 ease-out
                                        hover:scale-[1.02] hover:shadow-2xl
                                        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                                    `}
                                    style={{
                                        transitionDelay: `${index * 50}ms`,
                                    }}
                                >
                                    {/* Category Tag & Reading Time */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#D4EE72] text-gray-900">
                                            {category}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {t("readTime", { count: readingTime })}
                                        </span>
                                    </div>

                                    {/* Card Content */}
                                    <div
                                        className={`
                                            ${style.bg} rounded-[16px] overflow-hidden relative
                                            transition-all duration-300
                                            group-hover:shadow-xl
                                            aspect-[4/3] min-h-[220px]
                                            ${style.type === "overlay" ? "p-6 flex flex-col justify-end" : ""}
                                            ${hasThumbnail && style.type === "image" ? "bg-contain bg-no-repeat bg-center" : ""}
                                            ${hasThumbnail && style.type !== "image" ? "bg-cover bg-center" : ""}
                                        `}
                                        style={
                                            hasThumbnail
                                                ? {
                                                    backgroundImage: `url(${post.thumbnail})`,
                                                }
                                                : undefined
                                        }
                                    >
                                        {hasThumbnail && (
                                            <div
                                                className={`absolute inset-0 ${style.type === "overlay" ? "bg-gradient-to-t from-black/50 via-black/20 to-transparent" : "bg-black/10"}`}
                                            />
                                        )}

                                        {/* For overlay type - text on colored background */}
                                        {style.type === "overlay" && (
                                            <h3 className={`relative z-10 text-2xl font-bold leading-tight ${style.titleColor}`}>
                                                {post.title}
                                            </h3>
                                        )}

                                        {/* For image type - image is set as background */}
                                        {style.type === "image" && post.thumbnail && null}

                                        {/* For centered/gradient/highlight - centered content */}
                                        {(style.type === "centered" || style.type === "gradient" || style.type === "highlight") && (
                                            <div className="w-full h-full flex items-center justify-center p-5">
                                                {!post.thumbnail && (
                                                    <h3 className={`text-2xl font-bold text-center leading-tight ${style.titleColor}`}>
                                                        {post.title}
                                                    </h3>
                                                )}
                                            </div>
                                        )}

                                        {/* Fallback for image type without thumbnail */}
                                        {style.type === "image" && !post.thumbnail && (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <h3 className="text-2xl md:text-3xl font-black text-center leading-tight text-gray-900 px-6">
                                                    {post.title}
                                                </h3>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title & Description below card */}
                                    <div className="mt-4">
                                        {style.type !== "overlay" && (
                                            <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-gray-700 transition-colors">
                                                {post.title}
                                            </h3>
                                        )}
                                        {style.type === "overlay" && (
                                            <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-gray-700 transition-colors">
                                                {post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title}
                                            </h3>
                                        )}
                                        {post.content && (
                                            <span className="text-sm text-gray-500 mt-1 line-clamp-2 block">
                                                <ReactMarkdown
                                                    skipHtml
                                                    allowedElements={["p", "strong", "em", "a", "code", "span", "br"]}
                                                    components={{
                                                        p: ({ children }) => <span>{children}</span>,
                                                        a: ({ children }) => <span className="underline underline-offset-4">{children}</span>,
                                                        code: ({ children }) => <code className="font-mono text-[0.85em]">{children}</code>,
                                                    }}
                                                >
                                                    {excerpt}
                                                </ReactMarkdown>
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Custom styles for animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </main>
    );
}

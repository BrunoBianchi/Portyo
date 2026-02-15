import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getPublicSitePosts, type SitePost } from "~/services/site-blog.service";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";
import { Clock, ArrowRight, ArrowUpRight } from "lucide-react";

import type { MetaFunction } from "react-router";

export const meta: MetaFunction = ({ params }) => {
    const lang = params?.lang === "pt" ? "pt" : "en";
    const title = i18n.t("blogPage.meta.title", { lng: lang });
    const description = i18n.t("blogPage.meta.description", { lng: lang });

    return [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
    ];
};

// Calculate estimated reading time
function getReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const textOnly = content.replace(/<[^>]*>/g, "");
    const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function getExcerpt(content: string, maxChars = 140): string {
    const textOnly = content.replace(/<[^>]*>/g, "").trim();
    if (textOnly.length <= maxChars) return textOnly;
    return `${textOnly.slice(0, maxChars).trimEnd()}...`;
}

function toSlug(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function getCanonicalPostSlug(post: SitePost): string {
    if (post.slug && post.slug.trim()) return post.slug.trim();
    const derived = toSlug(post.title || "");
    if (derived) return derived;
    return `post-${post.id.slice(0, 8)}`;
}

export default function BlogIndex() {
    const { t, i18n } = useTranslation("blogPage");
    const [posts, setPosts] = useState<SitePost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const lang = i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en";
        getPublicSitePosts(lang).then((data) => {
            setPosts(data || []);
            setLoading(false);
        });
    }, [i18n.language, i18n.resolvedLanguage]);

    const featuredPost = posts[0];
    const regularPosts = posts.slice(1);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F3F3F1]">
                <div className="w-8 h-8 border-4 border-[#1A1A1A] border-t-[#D2E823] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F3F3F1] pt-20 md:pt-24 pb-16 md:pb-20">
            {/* Header */}
            <header className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-12 md:mb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b-2 md:border-b-4 border-[#1A1A1A] pb-6 md:pb-8">
                    <div>
                        <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-[#D2E823] text-[#1A1A1A] font-black text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4 border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] sm:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                            {t("badge", "The Blog")}
                        </span>
                        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black text-[#1A1A1A] leading-[0.9] tracking-tighter break-words" style={{ fontFamily: 'var(--font-display)' }}>
                            INSIGHTS
                        </h1>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A1A] max-w-sm leading-tight text-left md:text-left self-start md:self-auto">
                        {t("subtitle", "Stories and strategies for the modern creator economy.")}
                    </p>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                {posts.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-[#1A1A1A]/20 rounded-3xl">
                        <p className="text-xl font-bold text-[#1A1A1A]/40">{t("empty", "No posts yet.")}</p>
                    </div>
                ) : (
                    <div className="space-y-10 md:space-y-16">
                        {/* Featured Post */}
                        {featuredPost && (
                            <Link
                                to={`/${i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en"}/blog/${getCanonicalPostSlug(featuredPost)}`}
                                className="group block relative"
                            >
                                <article className="grid lg:grid-cols-12 gap-0 border-2 border-[#1A1A1A] bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:md:shadow-[12px_12px_0px_0px_rgba(210,232,35,1)] hover:-translate-y-1 transition-all duration-300">
                                    {/* Image */}
                                    <div className="lg:col-span-7 relative h-56 sm:h-72 md:h-[420px] lg:h-[600px] overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-[#1A1A1A] bg-[#1A1A1A]">
                                        {featuredPost.thumbnail ? (
                                            <img
                                                src={featuredPost.thumbnail}
                                                alt={featuredPost.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#D2E823]">
                                                <span className="text-7xl md:text-9xl font-black text-[#1A1A1A]/10">IMG</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 md:top-6 md:left-6">
                                            <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-[#1A1A1A] font-black text-[10px] md:text-xs uppercase tracking-widest border-2 border-[#1A1A1A]">
                                                {t("featured")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="lg:col-span-5 p-5 sm:p-6 lg:p-12 flex flex-col justify-between">
                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                                                {(Array.isArray(featuredPost.keywords) ? featuredPost.keywords : [featuredPost.keywords || t("categoryFallback", "Article")]).slice(0, 2).map((keyword, i) => (
                                                    <span key={i} className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60">#{keyword}</span>
                                                ))}
                                            </div>
                                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A1A] leading-tight mb-4 md:mb-6 group-hover:underline decoration-4 underline-offset-4 decoration-[#D2E823]" style={{ fontFamily: 'var(--font-display)' }}>
                                                {featuredPost.title}
                                            </h2>
                                            <p className="text-base md:text-lg font-medium text-[#1A1A1A]/70 line-clamp-3 mb-6 md:mb-8 leading-relaxed">
                                                {featuredPost.content ? getExcerpt(featuredPost.content, 200) : ""}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 md:pt-8 border-t-2 border-[#1A1A1A]/10">
                                            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                                                <Clock className="w-4 h-4" />
                                                <span>{t("minRead", { count: getReadingTime(featuredPost.content || "") })}</span>
                                            </div>
                                            <span className="self-start flex items-center gap-2 font-black text-[#1A1A1A] bg-[#D2E823] px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] group-hover:translate-x-1 transition-transform">
                                                {t("readNow")} <ArrowRight className="w-5 h-5" />
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        )}

                        {/* Regular Posts Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {regularPosts.map((post, index) => {
                                const readingTime = post.content ? getReadingTime(post.content) : 2;
                                const category = (Array.isArray(post.keywords) ? post.keywords[0] : post.keywords) || t("categoryFallback", "Article");

                                return (
                                    <Link
                                        key={post.id}
                                        to={`/${i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en"}/blog/${getCanonicalPostSlug(post)}`}
                                        className="group flex flex-col h-full bg-white border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:md:shadow-[8px_8px_0px_0px_rgba(0,71,255,1)] hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {/* Image */}
                                        <div className="aspect-[4/3] bg-[#1A1A1A] overflow-hidden border-b-2 border-[#1A1A1A] relative">
                                            {post.thumbnail ? (
                                                <img
                                                    src={post.thumbnail}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#F3F3F1]">
                                                    <span className="text-5xl font-black text-[#1A1A1A]/10">IMG</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4">
                                                <div className="bg-white border-2 border-[#1A1A1A] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowUpRight className="w-5 h-5 text-[#1A1A1A]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 sm:p-6 flex flex-col flex-1">
                                            <div className="mb-4">
                                                <span className="inline-block px-3 py-1 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider mb-3">
                                                    {category}
                                                </span>
                                                <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] leading-tight group-hover:text-[#0047FF] transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                                                    {post.title}
                                                </h3>
                                            </div>

                                            <p className="text-[#1A1A1A]/70 font-medium text-sm line-clamp-3 mb-6 flex-1">
                                                {post.content ? getExcerpt(post.content, 110) : ""}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]/40 pt-4 border-t-2 border-[#1A1A1A]/5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{t("minRead", { count: readingTime })}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

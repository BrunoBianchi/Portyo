import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getPublicSitePosts, type SitePost } from '~/services/site-blog.service';
import { Link } from 'react-router';
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

interface BlogPost {
    id: number | string;
    title: string;
    content?: string;
    category: string;
    thumbnail?: string;
}

export default function BlogSection() {
    const { t, i18n } = useTranslation(["home", "blogPage"]);
    const currentLang = i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en";
    const withLang = (to: string) => (to.startsWith("/") ? `/${currentLang}${to}` : `/${currentLang}/${to}`);

    const cardStyles = [
        {
            bg: "bg-[#1A3B38]",
            textColor: "text-white",
            titleColor: "text-[#D4EE72]",
            type: "overlay",
        },
        {
            bg: "bg-gradient-to-br from-[#B4E4FF] via-[#E8D8F0] to-[#D4EE72]",
            textColor: "text-gray-900",
            titleColor: "text-gray-900",
            type: "image",
        },
        {
            bg: "bg-[#E8D8F0]",
            textColor: "text-gray-800",
            titleColor: "text-gray-900",
            type: "centered",
        },
        {
            bg: "bg-gradient-to-br from-[#B4E4FF] to-[#E8D8F0]",
            textColor: "text-gray-800",
            titleColor: "text-gray-900",
            type: "gradient",
        },
        {
            bg: "bg-[#D4EE72]",
            textColor: "text-gray-800",
            titleColor: "text-gray-900",
            type: "highlight",
        },
    ];

    const [posts, setPosts] = useState<BlogPost[]>([]);

    const getReadingTime = (content: string): number => {
        const wordsPerMinute = 200;
        const textOnly = content.replace(/<[^>]*>/g, "");
        const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    };

    const getExcerpt = (content: string, maxChars = 150): string => {
        const textOnly = content.replace(/<[^>]*>/g, "").trim();
        if (textOnly.length <= maxChars) return textOnly;
        return `${textOnly.slice(0, maxChars).trimEnd()}...`;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            const sitePosts = await getPublicSitePosts(currentLang);
            if (sitePosts && sitePosts.length > 0) {
                const mappedPosts: BlogPost[] = sitePosts.slice(0, 4).map((post) => ({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    category: post.keywords?.[0] || "",
                    thumbnail: post.thumbnail,
                }));

                setPosts(mappedPosts);
            } else {
                setPosts([]);
            }
        };
        fetchPosts();
    }, [currentLang]);

    if (posts.length === 0) return null;

    return (
        <section className="w-full py-16 px-4 bg-surface-alt">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tight">
                        {t("home.blogSection.title")}
                    </h2>
                    <Link
                        to={withLang("/blog")}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-bold text-text-main shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {t("home.blogSection.cta")}
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.map((post, index) => {
                        const style = cardStyles[index % cardStyles.length];
                        const hasThumbnail = Boolean(post.thumbnail);
                        const readingTime = post.content ? getReadingTime(post.content) : 2;
                        const excerpt = post.content ? getExcerpt(post.content, 150) : "";

                        return (
                        <Link
                            key={post.id}
                            to={post.id.toString().startsWith('default') ? withLang('/blog') : withLang(`/blog/${post.id}`)}
                            className="group flex h-full flex-col rounded-[16px] border border-black/10 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.35)]"
                        >
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
                                        ? { backgroundImage: `url(${post.thumbnail})` }
                                        : undefined
                                }
                            >
                                {hasThumbnail && (
                                    <div
                                        className={`absolute inset-0 ${style.type === "overlay" ? "bg-gradient-to-t from-black/50 via-black/20 to-transparent" : "bg-black/10"}`}
                                    />
                                )}

                                {style.type === "overlay" && (
                                    <h3 className={`relative z-10 text-2xl font-bold leading-tight ${style.titleColor}`}>
                                        {post.title}
                                    </h3>
                                )}

                                {(style.type === "centered" || style.type === "gradient" || style.type === "highlight") && (
                                    <div className="w-full h-full flex items-center justify-center p-5">
                                        {!post.thumbnail && (
                                            <h3 className={`text-2xl font-bold text-center leading-tight ${style.titleColor}`}>
                                                {post.title}
                                            </h3>
                                        )}
                                    </div>
                                )}

                                {style.type === "image" && !post.thumbnail && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <h3 className="text-2xl md:text-3xl font-black text-center leading-tight text-gray-900 px-6">
                                            {post.title}
                                        </h3>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-text-main">
                                    {post.category || t("blogPage.categoryFallback")}
                                </span>
                                <span className="rounded-full border border-black/10 px-3 py-1">
                                    {t("blogPage.readTime", { count: readingTime })}
                                </span>
                            </div>

                            <h3 className="mt-3 text-lg font-bold text-text-main leading-snug tracking-tight line-clamp-2">
                                {post.title}
                            </h3>

                            {excerpt && (
                                <span className="mt-2 text-sm text-text-muted line-clamp-3 block">
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
                        </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

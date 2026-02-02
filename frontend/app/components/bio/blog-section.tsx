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
    slug?: string;
}

export default function BlogSection() {
    const { t, i18n } = useTranslation(["home", "blogPage"]);
    const currentLang = i18n.resolvedLanguage?.startsWith("pt") ? "pt" : "en";
    const withLang = (to: string) => (to.startsWith("/") ? `/${currentLang}${to}` : `/${currentLang}/${to}`);

    // Estilos atualizados para tema dark com melhor contraste
    const cardStyles = [
        {
            bg: "bg-surface-card",
            textColor: "text-foreground",
            titleColor: "text-primary",
            type: "overlay",
            border: "border-primary/30",
            shadow: "shadow-primary/5",
        },
        {
            bg: "bg-surface-elevated",
            textColor: "text-foreground",
            titleColor: "text-primary",
            type: "image",
            border: "border-border",
            shadow: "shadow-black/30",
        },
        {
            bg: "bg-surface-card",
            textColor: "text-foreground",
            titleColor: "text-primary",
            type: "centered",
            border: "border-border",
            shadow: "shadow-black/20",
        },
        {
            bg: "bg-gradient-to-br from-primary/20 to-accent-purple/20",
            textColor: "text-foreground",
            titleColor: "text-primary",
            type: "gradient",
            border: "border-primary/30",
            shadow: "shadow-primary/10",
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
                    thumbnail: post.thumbnail || undefined,
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
        <section className="w-full py-16 px-4 bg-surface-muted">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                        {t("home.blogSection.title")}
                    </h2>
                    <Link
                        to={withLang("/blog")}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-surface-card px-6 py-3 text-sm font-bold text-foreground shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/20"
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
                            to={post.id.toString().startsWith('default') ? withLang('/blog') : withLang(`/blog/${post.slug || post.id}`)}
                            className={`group flex h-full flex-col rounded-2xl border ${style.border} bg-surface-card p-4 shadow-lg ${style.shadow} transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20`}
                        >
                            <div
                                className={`
                                    ${style.bg} rounded-2xl overflow-hidden relative
                                    transition-all duration-300
                                    group-hover:shadow-lg group-hover:shadow-primary/10
                                    aspect-[4/3] min-h-[220px]
                                    border ${style.border}
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
                                {/* Overlay escuro para melhor contraste */}
                                {hasThumbnail && (
                                    <div
                                        className={`absolute inset-0 ${style.type === "overlay" ? "bg-gradient-to-t from-background/90 via-background/50 to-transparent" : "bg-background/30"}`}
                                    />
                                )}

                                {/* Conteúdo sem thumbnail - com fundo gradiente sutil */}
                                {!hasThumbnail && (
                                    <div className="w-full h-full flex items-center justify-center p-5">
                                        <h3 className={`text-xl font-bold text-center leading-tight ${style.titleColor} drop-shadow-lg`}>
                                            {post.title}
                                        </h3>
                                    </div>
                                )}

                                {/* Título overlay quando tem thumbnail */}
                                {hasThumbnail && style.type === "overlay" && (
                                    <h3 className={`relative z-10 text-xl font-bold leading-tight text-foreground drop-shadow-lg`}>
                                        {post.title}
                                    </h3>
                                )}
                            </div>

                            {/* Tags e tempo de leitura */}
                            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                                <span className="rounded-full bg-primary/20 px-3 py-1 text-primary border border-primary/20">
                                    {post.category || t("blogPage.categoryFallback")}
                                </span>
                                <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-muted-foreground">
                                    {t("blogPage.readTime", { count: readingTime })}
                                </span>
                            </div>

                            {/* Título do post */}
                            <h3 className="mt-3 text-lg font-bold text-foreground leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {post.title}
                            </h3>

                            {/* Excerpt */}
                            {excerpt && (
                                <span className="mt-2 text-sm text-muted-foreground line-clamp-3 block">
                                    <ReactMarkdown
                                        skipHtml
                                        allowedElements={["p", "strong", "em", "a", "code", "span", "br"]}
                                        components={{
                                            p: ({ children }) => <span>{children}</span>,
                                            a: ({ children }) => <span className="underline underline-offset-4 text-primary">{children}</span>,
                                            code: ({ children }) => <code className="font-mono text-[0.85em] bg-muted px-1 rounded">{children}</code>,
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

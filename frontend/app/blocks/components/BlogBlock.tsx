/**
 * BlogBlock — fetches and displays blog posts in carousel/grid/list layouts.
 * Card styles: featured, modern, minimal. Clicking opens BlogPostPopup.
 */
import React, { useEffect, useState, lazy, Suspense } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { api } from '~/services/api';

const BlogPostPopup = lazy(() =>
    import('~/components/bio/blog-post-popup').then(m => ({
        default: m.BlogPostPopup,
    }))
);

interface BlogPost {
    id: string;
    title: string;
    content: string;
    summary?: string;
    image?: string;
    imageUrl?: string;
    date?: string;
    createdAt?: string;
    author?: string;
    authorImage?: string;
    tags?: string[];
    category?: string;
    readTime?: number;
    slug?: string;
}

export const BlogBlock: React.FC<BlockComponentProps> = ({ block, bioId }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const layout = block.blogLayout || 'carousel';
    const cardStyle = block.blogCardStyle || 'featured';
    const showImages = block.blogShowImages !== false;
    const showDates = block.blogShowDates !== false;
    const bgColor = block.blogBackgroundColor || 'transparent';
    const titleColor = block.blogTitleColor || '#1f2937';
    const textColor = block.blogTextColor || '#6b7280';
    const dateColor = block.blogDateColor || '#9ca3af';
    const tagBgColor = block.blogTagBackgroundColor || '#e5e7eb';
    const tagTextColor = block.blogTagTextColor || '#374151';
    const popupStyle = block.blogPopupStyle || 'classic';
    const popupBgColor = block.blogPopupBackgroundColor || '#ffffff';
    const popupTextColor = block.blogPopupTextColor || '#1f2937';
    const popupOverlayColor = block.blogPopupOverlayColor || 'rgba(0,0,0,0.6)';

    useEffect(() => {
        if (!bioId) return;
        let cancelled = false;

        api.get(`/public/blog/${bioId}`)
            .then((response) => {
                if (cancelled) return;
                const data = response?.data;
                const items = Array.isArray(data) ? data : data?.posts || [];
                setPosts(items.slice(0, block.blogPostCount || 6));
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error('Failed to load bio blog posts:', error);
                    setPosts([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [bioId, block.blogPostCount]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) return dateStr;
            const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = months[date.getUTCMonth()] || '';
            const year = date.getUTCFullYear();
            return `${day} ${month} ${year}`.trim();
        } catch { return dateStr; }
    };

    if (loading) {
        return (
            <BlockWrapper block={block}>
                <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{
                            minWidth: '220px', height: '180px', background: '#e5e7eb',
                            borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                    ))}
                </div>
            </BlockWrapper>
        );
    }

    if (posts.length === 0) {
        return (
            <BlockWrapper block={block}>
                <div style={{ textAlign: 'center', padding: '20px', color: textColor, fontSize: '13px' }}>
                    Nenhum post encontrado
                </div>
            </BlockWrapper>
        );
    }

    // --- Card renderers ---
    const renderFeaturedCard = (post: BlogPost) => (
        <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            style={{
                minWidth: layout === 'carousel' ? '300px' : undefined,
                maxWidth: layout === 'carousel' ? '300px' : undefined,
                background: bgColor === 'transparent' ? 'white' : bgColor,
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                scrollSnapAlign: 'start',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                flexShrink: 0,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.14)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
        >
            {showImages && (post.image || post.imageUrl) ? (
                <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img
                        src={post.image || post.imageUrl}
                        alt={post.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    />
                </div>
            ) : showImages ? (
                <div style={{
                    height: '160px',
                    background: `linear-gradient(135deg, ${titleColor}15 0%, ${titleColor}08 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={titleColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
            ) : null}
            <div style={{ padding: '16px 18px' }}>
                {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} style={{
                                fontSize: '11px', padding: '4px 10px',
                                background: tagBgColor, color: tagTextColor,
                                borderRadius: '99px', fontWeight: 600,
                            }}>{tag}</span>
                        ))}
                    </div>
                )}
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: titleColor, margin: '0 0 8px 0', lineHeight: 1.4,
                    letterSpacing: '-0.01em',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.title}
                </h4>
                {post.summary && (
                    <p style={{ fontSize: '13px', color: textColor, margin: '0 0 10px 0', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.summary}
                    </p>
                )}
                {showDates && (
                    <span style={{ fontSize: '12px', color: dateColor, fontWeight: 500 }}>
                        {formatDate(post.date || post.createdAt)}
                    </span>
                )}
            </div>
        </div>
    );

    const renderModernCard = (post: BlogPost) => (
        <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            style={{
                minWidth: layout === 'carousel' ? '320px' : undefined,
                maxWidth: layout === 'carousel' ? '320px' : undefined,
                padding: '20px',
                background: bgColor === 'transparent' ? 'white' : bgColor,
                borderRadius: '18px',
                cursor: 'pointer',
                borderLeft: `3px solid ${titleColor}`,
                scrollSnapAlign: 'start',
                flexShrink: 0,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
            }}
        >
            {showDates && (
                <span style={{ fontSize: '13px', color: dateColor, fontWeight: 500 }}>
                    {formatDate(post.date || post.createdAt)}
                </span>
            )}
            <h4 style={{ fontSize: '17px', fontWeight: 700, color: titleColor, margin: '6px 0 8px 0', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                {post.title}
            </h4>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: textColor }}>
                {post.category && <span>{post.category}</span>}
                {post.readTime && <span>· {post.readTime} min</span>}
            </div>
        </div>
    );

    const renderMinimalCard = (post: BlogPost) => (
        <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            style={{
                minWidth: layout === 'carousel' ? '200px' : undefined,
                maxWidth: layout === 'carousel' ? '200px' : undefined,
                padding: '16px',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                flexShrink: 0,
                borderRadius: '14px',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.03)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
        >
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: titleColor, margin: '0 0 6px 0', lineHeight: 1.35,
                letterSpacing: '-0.01em',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.title}
            </h4>
            {post.readTime && (
                <span style={{ fontSize: '12px', color: textColor }}>{post.readTime} min de leitura</span>
            )}
            <div style={{ fontSize: '13px', color: titleColor, fontWeight: 600, marginTop: '8px' }}>
                Ler mais →
            </div>
        </div>
    );

    // --- Overlay card (text on top of image with gradient) ---
    const renderOverlayCard = (post: BlogPost, featured = false) => {
        const imgSrc = post.image || post.imageUrl;
        const h = featured ? '320px' : '220px';
        return (
            <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                style={{
                    minWidth: layout === 'carousel' ? (featured ? '360px' : '280px') : undefined,
                    maxWidth: layout === 'carousel' ? (featured ? '360px' : '280px') : undefined,
                    height: h,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    background: imgSrc ? `url(${imgSrc}) center/cover no-repeat` : `linear-gradient(135deg, ${titleColor}30, ${titleColor}10)`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
                }}
            >
                {/* dark gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)',
                }} />
                {/* content */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: featured ? '24px' : '16px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                }}>
                    {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {post.tags.slice(0, 2).map(tag => (
                                <span key={tag} style={{
                                    fontSize: '10px', padding: '3px 10px',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(4px)',
                                    color: '#fff', borderRadius: '99px', fontWeight: 600,
                                }}>{tag}</span>
                            ))}
                        </div>
                    )}
                    <h4 style={{
                        fontSize: featured ? '20px' : '15px', fontWeight: 800,
                        color: '#fff', margin: 0, lineHeight: 1.3,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }}>
                        {post.title}
                    </h4>
                    {featured && post.summary && (
                        <p style={{
                            fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {post.summary}
                        </p>
                    )}
                    {showDates && (
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                            {formatDate(post.date || post.createdAt)}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // --- Horizontal card (image left, text right) ---
    const renderHorizontalCard = (post: BlogPost) => {
        const imgSrc = post.image || post.imageUrl;
        return (
            <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'stretch',
                    background: bgColor === 'transparent' ? 'white' : bgColor,
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    minWidth: layout === 'carousel' ? '380px' : undefined,
                    maxWidth: layout === 'carousel' ? '380px' : undefined,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                }}
            >
                {showImages && imgSrc ? (
                    <div style={{ width: '140px', minHeight: '130px', flexShrink: 0, overflow: 'hidden' }}>
                        <img src={imgSrc} alt={post.title} loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                ) : showImages ? (
                    <div style={{
                        width: '140px', minHeight: '130px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${titleColor}15, ${titleColor}08)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={titleColor} strokeWidth="1.5" opacity="0.2">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                ) : null}
                <div style={{
                    flex: 1, padding: '16px 18px 16px 0',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px',
                    paddingLeft: showImages ? '0' : '18px',
                }}>
                    {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {post.tags.slice(0, 2).map(tag => (
                                <span key={tag} style={{
                                    fontSize: '10px', padding: '3px 8px',
                                    background: tagBgColor, color: tagTextColor,
                                    borderRadius: '99px', fontWeight: 600,
                                }}>{tag}</span>
                            ))}
                        </div>
                    )}
                    <h4 style={{
                        fontSize: '15px', fontWeight: 700, color: titleColor, margin: 0, lineHeight: 1.35,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {post.title}
                    </h4>
                    {post.summary && (
                        <p style={{
                            fontSize: '12px', color: textColor, margin: 0, lineHeight: 1.5,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {post.summary}
                        </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        {showDates && (
                            <span style={{ fontSize: '11px', color: dateColor, fontWeight: 500 }}>
                                {formatDate(post.date || post.createdAt)}
                            </span>
                        )}
                        {post.readTime && (
                            <span style={{ fontSize: '11px', color: dateColor }}>· {post.readTime} min</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCard = (post: BlogPost, idx?: number) => {
        switch (cardStyle) {
            case 'modern': return renderModernCard(post);
            case 'minimal': return renderMinimalCard(post);
            case 'overlay': return renderOverlayCard(post, layout === 'magazine' && idx === 0);
            case 'horizontal': return renderHorizontalCard(post);
            default: return renderFeaturedCard(post);
        }
    };

    const isCarousel = layout === 'carousel';

    // --- Magazine layout: first post large, rest in 2-col grid ---
    if (layout === 'magazine') {
        const [firstPost, ...restPosts] = posts;
        return (
            <BlockWrapper block={block}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Hero / featured post */}
                    {firstPost && (
                        cardStyle === 'overlay'
                            ? renderOverlayCard(firstPost, true)
                            : <div style={{ width: '100%' }}>{renderCard(firstPost, 0)}</div>
                    )}
                    {/* Remaining posts in 2-col grid */}
                    {restPosts.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '14px',
                        }}>
                            {restPosts.map((p, i) => renderCard(p, i + 1))}
                        </div>
                    )}
                </div>

                {selectedPost && (
                    <Suspense fallback={null}>
                        <BlogPostPopup
                            post={selectedPost}
                            config={{
                                style: popupStyle as 'classic' | 'modern' | 'simple',
                                backgroundColor: popupBgColor,
                                textColor: popupTextColor,
                                overlayColor: popupOverlayColor,
                            }}
                            onClose={() => setSelectedPost(null)}
                        />
                    </Suspense>
                )}
            </BlockWrapper>
        );
    }

    const containerStyle: React.CSSProperties = isCarousel ? {
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        paddingBottom: '8px',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
    } : layout === 'grid' ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
    } : {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    };

    return (
        <BlockWrapper block={block}>
            <div style={containerStyle}>
                {posts.map((p, i) => renderCard(p, i))}
            </div>

            {selectedPost && (
                <Suspense fallback={null}>
                    <BlogPostPopup
                        post={selectedPost}
                        config={{
                            style: popupStyle as 'classic' | 'modern' | 'simple',
                            backgroundColor: popupBgColor,
                            textColor: popupTextColor,
                            overlayColor: popupOverlayColor,
                        }}
                        onClose={() => setSelectedPost(null)}
                    />
                </Suspense>
            )}
        </BlockWrapper>
    );
};

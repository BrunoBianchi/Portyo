/**
 * InstagramBlock — renders Instagram profile link or feed grid.
 * 3 variations: simple-link, grid-shop, visual-gallery.
 * Grid/gallery variations fetch posts from the API.
 */
import React, { useEffect, useState } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { radiusToShape, resolveShadow } from './types';

interface InstagramPost {
    url: string;
    imageUrl: string;
}

const INSTAGRAM_GRADIENT = 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)';

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const ShoppingIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" fill="none" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" fill="none" />
    </svg>
);

export const InstagramBlock: React.FC<BlockComponentProps> = ({ block, bioId, globalButtonStyle }) => {
    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [loading, setLoading] = useState(false);
    const g = globalButtonStyle || {};

    const username = block.instagramUsername || '';
    const variation = block.instagramVariation || 'simple-link';
    const textColor = block.instagramTextColor || '#0095f6';
    const textPosition = block.instagramTextPosition || 'top';
    const showText = block.instagramShowText !== false;
    const title = block.instagramTitle || '';

    // Global button shape for simple-link
    const globalShape = radiusToShape(g.buttonRadius);
    const simpleLinkRadius = globalShape === 'pill' ? '9999px' : globalShape === 'square' ? '4px' : '14px';
    const globalShadow = resolveShadow(g.buttonShadow);

    useEffect(() => {
        if (variation === 'simple-link' || !username) return;

        let cancelled = false;
        setLoading(true);

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        fetch(`${origin}/api/public/instagram/${encodeURIComponent(username)}`)
            .then(r => r.json())
            .then(data => {
                if (!cancelled) {
                    const items = Array.isArray(data) ? data : data?.posts || [];
                    setPosts(items.slice(0, 3));
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [username, variation]);

    const profileUrl = `https://instagram.com/${username}`;

    const usernameLink = showText && username ? (
        <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: textColor,
                textDecoration: 'none',
                justifyContent: 'center',
                margin: textPosition === 'top' ? '0 0 8px 0' : '8px 0 0 0',
            }}
        >
            <InstagramIcon size={20} />
            @{username}
        </a>
    ) : null;

    // --- simple-link variation ---
    if (variation === 'simple-link') {
        return (
            <BlockWrapper block={block}>
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 24px',
                        background: INSTAGRAM_GRADIENT,
                        color: 'white',
                        borderRadius: simpleLinkRadius,
                        fontWeight: 700,
                        fontSize: '15px',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s, transform 0.2s',
                        boxShadow: (globalShadow && globalShadow !== 'none') ? globalShadow : '0 4px 14px rgba(225, 48, 108, 0.3)',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.transform = 'translateY(-2px)'; (e.currentTarget).style.opacity = '0.95'; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.transform = 'translateY(0)'; (e.currentTarget).style.opacity = '1'; }}
                >
                    <InstagramIcon size={22} />
                    {title || `Siga @${username}`}
                </a>
            </BlockWrapper>
        );
    }

    // --- grid-shop / visual-gallery ---
    const isGridShop = variation === 'grid-shop';

    return (
        <BlockWrapper block={block}>
            {textPosition === 'top' && usernameLink}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: isGridShop ? '6px' : '3px',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                aspectRatio: '1',
                                background: '#e5e7eb',
                                borderRadius: isGridShop ? '4px' : '0',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    ))
                ) : posts.length > 0 ? (
                    posts.map((post, i) => (
                        <a
                            key={i}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block',
                                position: 'relative',
                                aspectRatio: '1',
                                overflow: 'hidden',
                                borderRadius: isGridShop ? '4px' : '0',
                            }}
                        >
                            <img
                                src={post.imageUrl}
                                alt={`Instagram post ${i + 1}`}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: isGridShop ? 'transform 0.3s' : 'opacity 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                    if (isGridShop) (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                                    else (e.target as HTMLImageElement).style.opacity = '0.85';
                                }}
                                onMouseLeave={(e) => {
                                    if (isGridShop) (e.target as HTMLImageElement).style.transform = 'scale(1)';
                                    else (e.target as HTMLImageElement).style.opacity = '1';
                                }}
                            />
                            {isGridShop && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.3s',
                                }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                                >
                                    <ShoppingIcon />
                                </div>
                            )}
                        </a>
                    ))
                ) : (
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            gridColumn: 'span 3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '20px',
                            color: textColor,
                            fontSize: '13px',
                            textDecoration: 'none',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: '10px',
                        }}
                    >
                        <InstagramIcon size={18} />
                        Ver perfil @{username}
                    </a>
                )}
            </div>

            {textPosition === 'bottom' && usernameLink}
        </BlockWrapper>
    );
};

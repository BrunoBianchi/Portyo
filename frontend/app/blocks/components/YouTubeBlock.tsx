/**
 * YouTubeBlock — renders a single video embed or a video feed grid.
 * Variations: single-video, full-channel, playlist.
 */
import React, { useEffect, useState } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

interface YouTubeVideo {
    url: string;
    imageUrl: string;
    title?: string;
}

const extractVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

const PlayIcon: React.FC = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
        <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.65)" />
        <polygon points="19,14 36,24 19,34" fill="white" />
    </svg>
);

const YouTubeIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

export const YouTubeBlock: React.FC<BlockComponentProps> = ({ block, bioId }) => {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);

    const url = block.youtubeUrl || '';
    const variation = block.youtubeVariation || 'single-video';
    const textColor = block.youtubeTextColor || '#ff0000';
    const textPosition = block.youtubeTextPosition || 'top';
    const showText = block.youtubeShowText !== false;
    const title = block.youtubeTitle || '';

    useEffect(() => {
        if (variation === 'single-video' || !url) return;

        let cancelled = false;
        setLoading(true);

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        fetch(`${origin}/api/public/youtube/fetch?url=${encodeURIComponent(url)}`)
            .then(r => r.json())
            .then(data => {
                if (!cancelled) {
                    const items = Array.isArray(data) ? data : data?.videos || [];
                    setVideos(items.slice(0, 3));
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [url, variation]);

    const channelLink = showText && url ? (
        <a
            href={url}
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
            <YouTubeIcon />
            {title || 'YouTube'}
        </a>
    ) : null;

    // --- single-video ---
    if (variation === 'single-video') {
        const videoId = extractVideoId(url);
        if (!videoId) {
            return (
                <BlockWrapper block={block}>
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        URL de vídeo inválida
                    </div>
                </BlockWrapper>
            );
        }
        return (
            <BlockWrapper block={block}>
                {title && (
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0', textAlign: 'center' }}>
                        {title}
                    </h3>
                )}
                <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={title || 'YouTube Video'}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
            </BlockWrapper>
        );
    }

    // --- full-channel / playlist ---
    return (
        <BlockWrapper block={block}>
            {textPosition === 'top' && channelLink}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
            }}>
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                aspectRatio: '16/9',
                                background: '#e5e7eb',
                                borderRadius: '6px',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    ))
                ) : videos.length > 0 ? (
                    videos.map((video, i) => (
                        <a
                            key={i}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block',
                                position: 'relative',
                                aspectRatio: '16/9',
                                overflow: 'hidden',
                                borderRadius: '6px',
                            }}
                        >
                            <img
                                src={video.imageUrl}
                                alt={video.title || `Video ${i + 1}`}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.15)',
                                transition: 'background 0.3s',
                            }}>
                                <PlayIcon />
                            </div>
                        </a>
                    ))
                ) : (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
                        Nenhum vídeo encontrado
                    </div>
                )}
            </div>

            {textPosition === 'bottom' && channelLink}
        </BlockWrapper>
    );
};

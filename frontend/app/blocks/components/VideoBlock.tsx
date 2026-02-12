/**
 * VideoBlock — renders a YouTube or other video embed.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

const extractYouTubeId = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

export const VideoBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const videoId = extractYouTubeId(block.mediaUrl);

    if (!videoId) {
        return null;
    }

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        borderRadius: '12px',
        width: '100%',
    };

    const iframeStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
    };

    return (
        <BlockWrapper block={block}>
            {block.title && (
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', textAlign: 'center' }}>
                    {block.title}
                </h3>
            )}
            <div style={containerStyle}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={block.title || 'Video'}
                    style={iframeStyle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
            </div>
        </BlockWrapper>
    );
};

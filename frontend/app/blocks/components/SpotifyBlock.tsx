/**
 * SpotifyBlock — renders a Spotify embed (track, album, artist, playlist).
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

const parseSpotifyUrl = (url?: string): { type: string; id: string } | null => {
    if (!url) return null;
    const match = url.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return { type: match[1], id: match[2] };
};

const getEmbedHeight = (type: string, variation?: string): number => {
    if (variation === 'artist-profile' || type === 'artist') return 352;
    if (type === 'album' || type === 'playlist') return 380;
    if (type === 'show') return 232;
    return 152; // single track
};

export const SpotifyBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const parsed = parseSpotifyUrl(block.spotifyUrl || block.mediaUrl);
    if (!parsed) return null;

    const height = getEmbedHeight(parsed.type, block.spotifyVariation);
    const compact = block.spotifyCompact ? '&theme=0' : '';

    return (
        <BlockWrapper block={block}>
            {block.title && (
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', textAlign: 'center' }}>
                    {block.title}
                </h3>
            )}
            <iframe
                src={`https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator${compact}`}
                width="100%"
                height={height}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '12px', border: 'none' }}
                title={block.title || 'Spotify'}
            />
        </BlockWrapper>
    );
};

/**
 * MapBlock — renders a Google Maps embed for a given address.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

export const MapBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const address = block.mapAddress;
    if (!address) return null;

    const encodedAddress = encodeURIComponent(address);

    // The Maps Embed API key comes from the environment (VITE_GOOGLE_MAPS_EMBED_KEY).
    // Without a key, fall back to the keyless embed used by the HTML generator.
    const mapsEmbedKey =
        typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined'
            ? (import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY as string | undefined)
            : undefined;
    const mapSrc = mapsEmbedKey
        ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsEmbedKey)}&q=${encodedAddress}`
        : `https://maps.google.com/maps?q=${encodedAddress}&t=m&z=15&output=embed&iwloc=near`;

    return (
        <BlockWrapper block={block}>
            {block.mapTitle && (
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', textAlign: 'center', color: block.textColor || 'inherit' }}>
                    {block.mapTitle}
                </h3>
            )}
            <div style={{ borderRadius: '12px', overflow: 'hidden', width: '100%', height: '300px' }}>
                <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title={block.mapTitle || 'Map'}
                />
            </div>
        </BlockWrapper>
    );
};

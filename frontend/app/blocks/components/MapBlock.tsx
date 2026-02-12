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

    return (
        <BlockWrapper block={block}>
            {block.mapTitle && (
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', textAlign: 'center', color: block.textColor || 'inherit' }}>
                    {block.mapTitle}
                </h3>
            )}
            <div style={{ borderRadius: '12px', overflow: 'hidden', width: '100%', height: '300px' }}>
                <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`}
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

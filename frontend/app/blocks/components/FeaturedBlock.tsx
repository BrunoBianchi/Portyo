/**
 * FeaturedBlock — renders a featured product/item card with image, title, price and CTA.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { normalizeExternalUrl } from '~/utils/security';

export const FeaturedBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const bgColor = block.featuredColor || '#f8fafc';
    const textColor = block.featuredTextColor || '#111827';

    return (
        <BlockWrapper block={block}>
            <div style={{
                background: bgColor,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
            }}>
                {block.featuredImage && (
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                        <img
                            src={block.featuredImage}
                            alt={block.featuredTitle || 'Featured'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                        />
                    </div>
                )}
                <div style={{ padding: '16px 20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: '0 0 4px 0' }}>
                        {block.featuredTitle || block.title || 'Featured'}
                    </h3>
                    {block.featuredPrice && (
                        <p style={{ fontSize: '20px', fontWeight: 800, color: block.accent || '#3b82f6', margin: '4px 0 12px 0' }}>
                            {block.featuredPrice}
                        </p>
                    )}
                    {block.body && (
                        <p style={{ fontSize: '14px', color: `${textColor}cc`, margin: '0 0 12px 0', lineHeight: 1.5 }}>
                            {block.body}
                        </p>
                    )}
                    {block.featuredUrl && (
                        <a
                            href={normalizeExternalUrl(block.featuredUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: block.accent || '#3b82f6',
                                color: '#fff',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '14px',
                            }}
                        >
                            View Details
                        </a>
                    )}
                </div>
            </div>
        </BlockWrapper>
    );
};

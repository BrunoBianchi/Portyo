/**
 * ButtonGridBlock — renders a 2-column grid of full-bleed image cards
 * matching the HTML generator's visual style with gradient overlays,
 * icon circles, and bottom-aligned title text.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { normalizeExternalUrl } from '~/utils/security';

/** Gradient palette for cards without images */
const FALLBACK_GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

export const ButtonGridBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const gridItems = block.gridItems || [];
    if (gridItems.length === 0) return null;

    return (
        <BlockWrapper block={block}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                width: '100%',
            }}>
                {gridItems.map((item: any, index: number) => {
                    const hasImage = !!item.image;
                    const fallbackGradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

                    return (
                        <a
                            key={item.id}
                            href={normalizeExternalUrl(item.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                aspectRatio: '261 / 151',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                textDecoration: 'none',
                                color: '#ffffff',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.transform = 'translateY(-4px) scale(1.02)';
                                el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.18)';
                                const img = el.querySelector('img');
                                if (img) img.style.transform = 'scale(1.08)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.transform = 'translateY(0) scale(1)';
                                el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                                const img = el.querySelector('img');
                                if (img) img.style.transform = 'scale(1)';
                            }}
                        >
                            {/* Background — image or gradient fallback */}
                            {hasImage ? (
                                <img
                                    src={item.image}
                                    alt={item.title || ''}
                                    loading="lazy"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            ) : (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: fallbackGradient,
                                }} />
                            )}

                            {/* Gradient overlay for readability */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)',
                                pointerEvents: 'none',
                            }} />

                            {/* Icon circle (top-left) */}
                            {item.icon && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.95)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    zIndex: 2,
                                }}>
                                    {item.icon}
                                </div>
                            )}

                            {/* Title at bottom */}
                            <div style={{
                                position: 'relative',
                                zIndex: 2,
                                padding: '14px 16px',
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                                    lineHeight: 1.3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>
                                    {item.title}
                                </span>
                            </div>
                        </a>
                    );
                })}
            </div>
        </BlockWrapper>
    );
};

/**
 * AffiliateBlock — renders an affiliate product card with code badge and copy functionality.
 */
import React, { useState, useCallback } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { normalizeExternalUrl } from '~/utils/security';

export const AffiliateBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const [copied, setCopied] = useState(false);
    const bgColor = block.affiliateColor || '#f8fafc';
    const textColor = block.affiliateTextColor || '#111827';

    const handleCopyCode = useCallback(async () => {
        if (!block.affiliateCode) return;
        try {
            await navigator.clipboard.writeText(block.affiliateCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const el = document.createElement('textarea');
            el.value = block.affiliateCode;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [block.affiliateCode]);

    return (
        <BlockWrapper block={block}>
            <div style={{
                background: bgColor,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
            }}>
                {block.affiliateImage && (
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                        <img
                            src={block.affiliateImage}
                            alt={block.affiliateTitle || 'Affiliate Product'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                        />
                    </div>
                )}
                <div style={{ padding: '16px 20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: '0 0 8px 0' }}>
                        {block.affiliateTitle || block.title || 'Affiliate'}
                    </h3>

                    {block.affiliateCode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{
                                padding: '6px 12px',
                                background: `${block.accent || '#3b82f6'}15`,
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 700,
                                color: block.accent || '#3b82f6',
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em',
                            }}>
                                {block.affiliateCode}
                            </div>
                            <button
                                onClick={handleCopyCode}
                                style={{
                                    padding: '6px 12px',
                                    background: copied ? '#22c55e' : (block.accent || '#3b82f6'),
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease',
                                }}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    )}

                    {block.body && (
                        <p style={{ fontSize: '14px', color: `${textColor}cc`, margin: '0 0 12px 0', lineHeight: 1.5 }}>
                            {block.body}
                        </p>
                    )}

                    {block.affiliateUrl && (
                        <a
                            href={normalizeExternalUrl(block.affiliateUrl)}
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
                            Shop Now
                        </a>
                    )}
                </div>
            </div>
        </BlockWrapper>
    );
};

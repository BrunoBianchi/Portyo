/**
 * QRCodeBlock — renders QR code(s) via api.qrserver.com.
 * Supports single, multiple, and grid layouts.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

export const QRCodeBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const layout = block.qrCodeLayout || 'single';
    const color = (block.qrCodeColor || '000000').replace('#', '');
    const bgColor = (block.qrCodeBgColor || 'ffffff').replace('#', '');

    const generateQRUrl = (value: string, size: number = 200) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=${color}&bgcolor=${bgColor}`;
    };

    // Single QR code
    if (layout === 'single' || !block.qrCodeItems?.length) {
        const value = block.qrCodeValue || 'https://portyo.me';
        return (
            <BlockWrapper block={block}>
                <div style={{ textAlign: 'center' }}>
                    {block.qrCodeTitle && (
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>
                            {block.qrCodeTitle}
                        </h3>
                    )}
                    <img
                        src={generateQRUrl(value, 250)}
                        alt={block.qrCodeTitle || 'QR Code'}
                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                        loading="lazy"
                    />
                </div>
            </BlockWrapper>
        );
    }

    // Multiple / Grid
    const items = block.qrCodeItems || [];

    return (
        <BlockWrapper block={block}>
            {block.qrCodeTitle && (
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0', textAlign: 'center' }}>
                    {block.qrCodeTitle}
                </h3>
            )}
            <div style={{
                display: 'grid',
                gridTemplateColumns: layout === 'grid' ? 'repeat(2, 1fr)' : '1fr',
                gap: '12px',
            }}>
                {items.map((item: any, index: number) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                        <img
                            src={generateQRUrl(item.value || item.url || '', 200)}
                            alt={item.label || `QR Code ${index + 1}`}
                            style={{ maxWidth: '160px', borderRadius: '8px' }}
                            loading="lazy"
                        />
                        {item.label && (
                            <p style={{ fontSize: '13px', fontWeight: 500, margin: '4px 0 0 0', color: '#6b7280' }}>
                                {item.label}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </BlockWrapper>
    );
};

/**
 * WhatsAppBlock — renders a WhatsApp chat link or pre-filled message form.
 */
import React, { useState, useCallback } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { radiusToShape, resolveShadow } from './types';

const WHATSAPP_STYLES: Record<string, React.CSSProperties> = {
    'solid': { backgroundColor: '#25D366', color: '#fff' },
    'outline': { backgroundColor: 'transparent', color: '#25D366', border: '2px solid #25D366' },
    'glass': { backgroundColor: 'rgba(37, 211, 102, 0.15)', color: '#25D366', backdropFilter: 'blur(10px)' },
    'gradient': { background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' },
    'neon': { backgroundColor: 'transparent', color: '#25D366', border: '2px solid #25D366', boxShadow: '0 0 10px rgba(37, 211, 102, 0.4)' },
    'minimal': { backgroundColor: 'transparent', color: '#25D366', textDecoration: 'underline' },
    'dark': { backgroundColor: '#075E54', color: '#fff' },
    'soft': { backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#25D366' },
};

const WHATSAPP_ICON = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

export const WhatsAppBlock: React.FC<BlockComponentProps> = ({ block, globalButtonStyle }) => {
    const g = globalButtonStyle || {};
    const [message, setMessage] = useState(block.whatsappMessage || '');
    const variation = block.whatsappVariation || 'direct-button';
    const number = (block.whatsappNumber || '').replace(/\D/g, '');
    const styleName = block.whatsappStyle || g.buttonStyle || 'solid';
    const shape = block.whatsappShape || radiusToShape(g.buttonRadius) || 'rounded';

    const baseStyle = WHATSAPP_STYLES[styleName] || WHATSAPP_STYLES['solid'];
    const borderRadius = shape === 'pill' ? '9999px' : shape === 'square' ? '4px' : '12px';
    const globalShadow = resolveShadow(g.buttonShadow);

    const handleSend = useCallback(() => {
        const encodedMsg = encodeURIComponent(message.trim());
        window.open(`https://wa.me/${number}?text=${encodedMsg}`, '_blank');
    }, [number, message]);

    if (variation === 'pre-filled-form') {
        return (
            <BlockWrapper block={block}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '100%',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxSizing: 'border-box',
                }}>
                    {block.title && (
                        <div style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                        }}>
                            {WHATSAPP_ICON}
                            <span>{block.title}</span>
                        </div>
                    )}
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            border: '1.5px solid #e5e7eb',
                            fontSize: '14px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            background: '#fafafa',
                            color: '#374151',
                            lineHeight: 1.5,
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#25D366';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 211, 102, 0.15)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        onClick={handleSend}
                        style={{
                            ...baseStyle,
                            borderRadius: borderRadius === '9999px' ? '12px' : borderRadius,
                            padding: '14px 24px',
                            fontWeight: 700,
                            fontSize: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            border: baseStyle.border || 'none',
                            transition: 'opacity 0.2s, transform 0.2s',
                            ...(globalShadow && globalShadow !== 'none' ? { boxShadow: globalShadow } : {}),
                        }}
                        onMouseEnter={(e) => { (e.currentTarget).style.opacity = '0.9'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { (e.currentTarget).style.opacity = '1'; (e.currentTarget).style.transform = 'translateY(0)'; }}
                    >
                        {WHATSAPP_ICON}
                        <span>Enviar no WhatsApp</span>
                    </button>
                </div>
            </BlockWrapper>
        );
    }

    // Default: direct-button
    return (
        <BlockWrapper block={block}>
            <a
                href={`https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    ...baseStyle,
                    borderRadius,
                    padding: '14px 24px',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                    border: baseStyle.border || 'none',
                    ...(globalShadow && globalShadow !== 'none' ? { boxShadow: globalShadow } : {}),
                }}
            >
                {WHATSAPP_ICON}
                <span>{block.title || 'Chat on WhatsApp'}</span>
            </a>
        </BlockWrapper>
    );
};

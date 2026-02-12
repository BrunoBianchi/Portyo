/**
 * ButtonBlock — renders a styled link button with 20+ style variants,
 * shapes, shadows, and optional NSFW gating.
 */
import React, { useCallback } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper, } from './BlockWrapper';
import { resolveShadow, radiusToShape } from './types';
import { normalizeExternalUrl } from '~/utils/security';

const BUTTON_STYLES: Record<string, (color: string, textColor: string) => React.CSSProperties> = {
    'solid': (bg, text) => ({ backgroundColor: bg, color: text }),
    'outline': (bg, text) => ({ backgroundColor: 'transparent', color: bg, border: `2px solid ${bg}` }),
    'ghost': (bg, text) => ({ backgroundColor: 'transparent', color: bg }),
    'soft': (bg, text) => ({ backgroundColor: `${bg}22`, color: bg }),
    'glass': (bg, text) => ({ backgroundColor: `${bg}33`, color: text, backdropFilter: 'blur(10px)' }),
    'gradient': (bg, text) => ({ background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, color: text }),
    'neon': (bg, text) => ({ backgroundColor: 'transparent', color: bg, border: `2px solid ${bg}`, boxShadow: `0 0 10px ${bg}66, inset 0 0 10px ${bg}22` }),
    'shadow': (bg, text) => ({ backgroundColor: bg, color: text, boxShadow: `0 4px 14px ${bg}66` }),
    'minimal': (_bg, _text) => ({ backgroundColor: 'transparent', color: 'inherit', textDecoration: 'underline' }),
    'pill': (bg, text) => ({ backgroundColor: bg, color: text, borderRadius: '9999px' }),
    'rounded': (bg, text) => ({ backgroundColor: bg, color: text, borderRadius: '12px' }),
    'square': (bg, text) => ({ backgroundColor: bg, color: text, borderRadius: '0' }),
    'elevated': (bg, text) => ({ backgroundColor: bg, color: text, boxShadow: '0 8px 25px -8px rgba(0,0,0,0.15)' }),
    'bordered': (bg, text) => ({ backgroundColor: bg, color: text, border: `2px solid ${bg}`, borderRadius: '8px' }),
    'underline': (_bg, _text) => ({ backgroundColor: 'transparent', color: 'inherit', borderBottom: '2px solid currentColor' }),
    'highlight': (bg, text) => ({ backgroundColor: `${bg}11`, color: bg, borderLeft: `4px solid ${bg}` }),
    'floating': (bg, text) => ({ backgroundColor: bg, color: text, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)', transform: 'translateY(-2px)' }),
    'retro': (bg, text) => ({ backgroundColor: bg, color: text, border: `3px solid black`, boxShadow: '4px 4px 0px black' }),
    'cyberpunk': (bg, text) => ({ backgroundColor: bg, color: text, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }),
    'material': (bg, text) => ({ backgroundColor: bg, color: text, boxShadow: '0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12)' }),
};

const SHAPE_RADIUS: Record<string, string> = {
    'rounded': '12px',
    'pill': '9999px',
    'square': '4px',
};

export const ButtonBlock: React.FC<BlockComponentProps> = ({ block, accentColor, globalButtonStyle }) => {
    const g = globalButtonStyle || {};
    const buttonColor = block.buttonColor || block.accent || g.buttonColor || accentColor || '#3b82f6';
    const buttonTextColor = block.buttonTextColor || g.buttonTextColor || '#ffffff';
    const buttonStyle = block.buttonStyle || g.buttonStyle || 'solid';
    const buttonShape = block.buttonShape || radiusToShape(g.buttonRadius) || 'rounded';

    const getStyleFn = BUTTON_STYLES[buttonStyle] || BUTTON_STYLES['solid'];
    const computedStyle = getStyleFn(buttonColor, buttonTextColor);
    
    const shadowStyle = resolveShadow(block.buttonShadow as string || g.buttonShadow, block.buttonShadowColor as string);

    const href = normalizeExternalUrl(block.href);
    const isNsfw = block.isNsfw;

    const style: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: block.buttonTextAlign || 'center',
        gap: '8px',
        width: '100%',
        padding: '14px 24px',
        borderRadius: SHAPE_RADIUS[buttonShape] || '12px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...computedStyle,
        ...(shadowStyle !== 'none' ? { boxShadow: shadowStyle } : {}),
    };

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (isNsfw) {
            e.preventDefault();
            // NSFW confirmation is handled by the parent bio-layout via event delegation
        }
    }, [isNsfw]);

    return (
        <BlockWrapper block={block}>
            <a 
                href={href} 
                target={isNsfw ? undefined : "_blank"} 
                rel="noopener noreferrer"
                style={style}
                onClick={handleClick}
                data-nsfw={isNsfw ? 'true' : undefined}
                data-nsfw-url={isNsfw ? href : undefined}
                data-nsfw-target="_blank"
            >
                {block.buttonImage && (
                    <img 
                        src={block.buttonImage} 
                        alt="" 
                        style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} 
                        loading="lazy"
                    />
                )}
                <span>{block.title || 'Link'}</span>
            </a>
        </BlockWrapper>
    );
};

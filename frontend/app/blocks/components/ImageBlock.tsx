/**
 * ImageBlock — renders an image with CSS filter effects and hover transformations.
 */
import React, { useState } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

const HOVER_EFFECTS: Record<string, React.CSSProperties> = {
    'zoom': { transform: 'scale(1.05)' },
    'rotate': { transform: 'rotate(2deg)' },
    'brightness': { filter: 'brightness(1.15)' },
    'blur': { filter: 'blur(2px)' },
    'grayscale': { filter: 'grayscale(0)' },
    'sepia': { filter: 'sepia(0.5)' },
    'shadow': { boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
};

export const ImageBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseFilter = [
        block.imageBlur ? `blur(${block.imageBlur}px)` : '',
        block.imageBrightness !== undefined ? `brightness(${block.imageBrightness}%)` : '',
        block.imageContrast !== undefined ? `contrast(${block.imageContrast}%)` : '',
        block.imageSaturation !== undefined ? `saturate(${block.imageSaturation}%)` : '',
        block.imageGrayscale ? `grayscale(${block.imageGrayscale}%)` : '',
        block.imageSepia ? `sepia(${block.imageSepia}%)` : '',
    ].filter(Boolean).join(' ') || undefined;

    const hoverEffect = isHovered && block.imageHoverEffect 
        ? HOVER_EFFECTS[block.imageHoverEffect] 
        : {};

    const imgStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: block.imageBorderRadius ? `${block.imageBorderRadius}px` : '8px',
        borderWidth: block.imageBorderWidth ? `${block.imageBorderWidth}px` : undefined,
        borderStyle: block.imageBorderWidth ? 'solid' : undefined,
        borderColor: block.imageBorderColor || undefined,
        transform: [
            block.imageScale ? `scale(${block.imageScale})` : '',
            block.imageRotation ? `rotate(${block.imageRotation}deg)` : '',
        ].filter(Boolean).join(' ') || undefined,
        filter: baseFilter,
        boxShadow: block.imageShadow || undefined,
        transition: 'all 0.3s ease',
        ...hoverEffect,
    };

    const containerStyle: React.CSSProperties = {
        textAlign: (block.align as React.CSSProperties['textAlign']) || 'center',
        overflow: 'hidden',
    };

    const src = block.mediaUrl || block.href;
    if (!src) return null;

    return (
        <BlockWrapper block={block}>
            <div style={containerStyle}>
                {block.href && block.mediaUrl ? (
                    <a href={block.href} target="_blank" rel="noopener noreferrer">
                        <img
                            src={block.mediaUrl}
                            alt={block.title || 'Image'}
                            style={imgStyle}
                            loading="lazy"
                            decoding="async"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        />
                    </a>
                ) : (
                    <img
                        src={src}
                        alt={block.title || 'Image'}
                        style={imgStyle}
                        loading="lazy"
                        decoding="async"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    />
                )}
            </div>
        </BlockWrapper>
    );
};

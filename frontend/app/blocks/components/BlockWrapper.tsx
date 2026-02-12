/**
 * BlockWrapper — applies per-block container styles (background, border, shadow,
 * opacity, padding, entrance animations).
 * 
 * Every block component is wrapped in this to get consistent styling.
 */
import React from 'react';
import type { BlockWrapperProps } from './types';
import { SHADOW_PRESETS, ENTRANCE_ANIMATIONS } from './types';

export const BlockWrapper: React.FC<BlockWrapperProps> = ({ block, children, className }) => {
    const hasCustomStyles = block.blockBackground || block.blockBorderWidth || 
        block.blockBorderColor || block.blockBorderRadius || block.blockShadow ||
        block.blockOpacity !== undefined || block.blockBlur || block.blockPadding ||
        block.entranceAnimation;

    if (!hasCustomStyles) {
        return (
            <div
                className={className}
                data-block-id={block.id}
                data-block-type={block.type}
                style={{ padding: '14px 0' }}
            >
                {children}
            </div>
        );
    }

    const shadowValue = block.blockShadow 
        ? (SHADOW_PRESETS[block.blockShadow] || block.blockShadow)
        : undefined;

    const shadowWithColor = shadowValue && block.blockShadowColor
        ? shadowValue.replace(/rgba?\([^)]+\)/g, block.blockShadowColor)
        : shadowValue;

    const entranceStyle = block.entranceAnimation 
        ? ENTRANCE_ANIMATIONS[block.entranceAnimation] 
        : undefined;

    const style: React.CSSProperties = {
        background: block.blockBackground || undefined,
        borderRadius: block.blockBorderRadius ? `${block.blockBorderRadius}px` : undefined,
        borderWidth: block.blockBorderWidth ? `${block.blockBorderWidth}px` : undefined,
        borderStyle: block.blockBorderWidth ? 'solid' : undefined,
        borderColor: block.blockBorderColor || undefined,
        boxShadow: shadowWithColor || undefined,
        opacity: block.blockOpacity !== undefined ? block.blockOpacity / 100 : undefined,
        filter: block.blockBlur ? `blur(${block.blockBlur}px)` : undefined,
        padding: block.blockPadding ? `${block.blockPadding}px` : undefined,
        ...entranceStyle,
        animationDelay: block.entranceDelay ? `${block.entranceDelay}s` : undefined,
    };

    return (
        <div 
            className={className} 
            style={style} 
            data-block-id={block.id} 
            data-block-type={block.type}
        >
            {children}
        </div>
    );
};

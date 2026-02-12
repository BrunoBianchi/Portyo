/**
 * HeadingBlock — renders a heading (h1-h6) with optional sub-body text.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

export const HeadingBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const style: React.CSSProperties = {
        textAlign: (block.align as React.CSSProperties['textAlign']) || 'center',
        color: block.textColor || 'inherit',
        fontSize: block.fontSize ? `${block.fontSize}px` : '26px',
        fontWeight: block.fontWeight || 700,
        margin: '8px 0',
        lineHeight: 1.3,
        wordBreak: 'break-word',
        letterSpacing: '-0.02em',
    };

    const bodyStyle: React.CSSProperties = {
        textAlign: (block.align as React.CSSProperties['textAlign']) || 'center',
        color: block.textColor || 'inherit',
        fontSize: '15px',
        opacity: 0.75,
        margin: '6px 0 0 0',
        lineHeight: 1.55,
    };

    return (
        <BlockWrapper block={block}>
            <h2 style={style}>{block.title}</h2>
            {block.body && <p style={bodyStyle}>{block.body}</p>}
        </BlockWrapper>
    );
};

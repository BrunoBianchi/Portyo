/**
 * TextBlock — renders a text paragraph with customizable styling.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

export const TextBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const style: React.CSSProperties = {
        textAlign: (block.align as React.CSSProperties['textAlign']) || 'center',
        color: block.textColor || 'inherit',
        fontSize: block.fontSize ? `${block.fontSize}px` : '16px',
        fontWeight: block.fontWeight || 400,
        lineHeight: 1.6,
        margin: '8px 0',
        padding: '0 16px',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    };

    return (
        <BlockWrapper block={block}>
            <p style={style}>{block.body || block.title}</p>
        </BlockWrapper>
    );
};

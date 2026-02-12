/**
 * DividerBlock — renders a visual separator (horizontal rule).
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

export const DividerBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const style: React.CSSProperties = {
        border: 'none',
        borderTop: `1px solid ${block.accent || 'rgba(0,0,0,0.1)'}`,
        margin: '16px 0',
        width: '100%',
    };

    return (
        <BlockWrapper block={block}>
            <hr style={style} />
        </BlockWrapper>
    );
};

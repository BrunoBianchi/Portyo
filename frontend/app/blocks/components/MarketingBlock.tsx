/**
 * MarketingBlock — renders the marketing slot widget for public bio pages.
 * Wraps the existing MarketingWidget component which handles
 * active ad rendering, impression tracking, and proposal form.
 */
import React, { lazy, Suspense } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

const MarketingWidget = lazy(() =>
    import('~/components/bio/marketing-widget').then(m => ({
        default: m.MarketingWidget ?? m.default,
    }))
);

export const MarketingBlock: React.FC<BlockComponentProps> = ({ block, bioId }) => {
    const slotId = block.marketingId;

    if (!slotId) {
        return (
            <BlockWrapper block={block}>
                <div style={{
                    textAlign: 'center', padding: '16px',
                    border: '1px dashed #d1d5db', borderRadius: '8px',
                    color: '#9ca3af', fontSize: '13px',
                }}>
                    Nenhum slot de marketing configurado
                </div>
            </BlockWrapper>
        );
    }

    return (
        <BlockWrapper block={block}>
            <Suspense fallback={
                <div style={{
                    padding: '24px', textAlign: 'center',
                    color: '#9ca3af', fontSize: '13px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                    Carregando...
                </div>
            }>
                <MarketingWidget slotId={slotId} bioId={bioId || ''} />
            </Suspense>
        </BlockWrapper>
    );
};

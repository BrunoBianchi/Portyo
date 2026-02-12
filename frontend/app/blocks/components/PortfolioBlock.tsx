/**
 * PortfolioBlock — renders the portfolio widget for public bio pages.
 * Wraps the existing PortfolioWidget component which handles
 * category filtering, item grid, and image lightbox.
 */
import React, { lazy, Suspense } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

const PortfolioWidget = lazy(() =>
    import('~/components/bio/portfolio-widget').then(m => ({
        default: m.PortfolioWidget ?? m.default,
    }))
);

export const PortfolioBlock: React.FC<BlockComponentProps> = ({ block, bioId }) => {
    const title = block.portfolioTitle || 'Portfólio';

    if (!bioId) {
        return (
            <BlockWrapper block={block}>
                <div style={{
                    textAlign: 'center', padding: '20px',
                    color: '#9ca3af', fontSize: '13px',
                }}>
                    Portfólio não disponível
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
                    Carregando portfólio...
                </div>
            }>
                <PortfolioWidget bioId={bioId} title={title} />
            </Suspense>
        </BlockWrapper>
    );
};

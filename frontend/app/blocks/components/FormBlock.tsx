/**
 * FormBlock — renders the form widget for public bio pages.
 * Wraps the existing FormWidget component which handles
 * field rendering, validation, and submission.
 */
import React, { lazy, Suspense } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

const FormWidget = lazy(() =>
    import('~/components/bio/form-widget').then(m => ({
        default: m.FormWidget,
    }))
);

export const FormBlock: React.FC<BlockComponentProps> = ({ block, bioId }) => {
    const formId = block.formId;
    const bgColor = block.formBackgroundColor || '#ffffff';
    const textColor = block.formTextColor || '#1f2937';

    if (!formId) {
        return (
            <BlockWrapper block={block}>
                <div style={{
                    textAlign: 'center', padding: '20px',
                    color: '#9ca3af', fontSize: '13px',
                }}>
                    Formulário não configurado
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
                    Carregando formulário...
                </div>
            }>
                <FormWidget
                    formId={formId}
                    bioId={bioId || ''}
                    backgroundColor={bgColor}
                    textColor={textColor}
                />
            </Suspense>
        </BlockWrapper>
    );
};

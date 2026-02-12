/**
 * ExperienceBlock — renders a work experience timeline.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

export const ExperienceBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const experiences = block.experiences || [];
    if (experiences.length === 0) return null;

    const dotColor = block.accent || '#3b82f6';
    const titleColor = block.textColor || '#111827';

    return (
        <BlockWrapper block={block}>
            {block.experienceTitle && (
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', textAlign: 'center', color: titleColor }}>
                    {block.experienceTitle}
                </h3>
            )}
            <div style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Timeline line */}
                <div style={{
                    position: 'absolute',
                    left: '6px',
                    top: '8px',
                    bottom: '8px',
                    width: '2px',
                    backgroundColor: `${dotColor}33`,
                }} />

                {experiences.map((exp: any, index: number) => (
                    <div key={index} style={{ position: 'relative', marginBottom: '20px' }}>
                        {/* Timeline dot */}
                        <div style={{
                            position: 'absolute',
                            left: '-21px',
                            top: '6px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: dotColor,
                            border: '2px solid white',
                            boxShadow: `0 0 0 2px ${dotColor}33`,
                        }} />

                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px 0', color: titleColor }}>
                            {exp.role}
                        </h4>
                        <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 2px 0', color: dotColor }}>
                            {exp.company}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                            {exp.period}{exp.location ? ` · ${exp.location}` : ''}
                        </p>
                        {exp.description && (
                            <p style={{ fontSize: '13px', color: '#4b5563', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                                {exp.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </BlockWrapper>
    );
};

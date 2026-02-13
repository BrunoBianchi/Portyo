/**
 * TourBlock — renders a horizontal scrollable carousel of tour date cards.
 */
import React from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { normalizeExternalUrl } from '~/utils/security';

export const TourBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const tours = block.tours || [];
    if (tours.length === 0) return null;

    return (
        <BlockWrapper block={block}>
            {block.tourTitle && (
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0', textAlign: 'center', color: block.textColor || 'inherit' }}>
                    {block.tourTitle}
                </h3>
            )}
            <div style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
            }}>
                {tours.map((tour: any, index: number) => {
                    const tourDate = tour.date ? new Date(tour.date) : null;
                    return (
                        <div
                            key={index}
                            style={{
                                minWidth: '240px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.08)',
                                background: '#fff',
                                scrollSnapAlign: 'start',
                                flexShrink: 0,
                            }}
                        >
                            {tour.image && (
                                <div style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
                                    <img
                                        src={tour.image}
                                        alt={tour.venue || tour.location || 'Tour'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div style={{ padding: '12px 16px' }}>
                                {tourDate && (
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: block.accent || '#6366f1', margin: '0 0 4px 0' }}>
                                        {tourDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                                    </p>
                                )}
                                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px 0' }}>
                                    {tour.venue || tour.location}
                                </h4>
                                {tour.location && tour.venue && (
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>
                                        {tour.location}
                                    </p>
                                )}

                                {/* Status badges */}
                                {tour.soldOut ? (
                                    <span style={{
                                        display: 'inline-block', padding: '4px 10px', fontSize: '11px',
                                        fontWeight: 700, borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626',
                                    }}>
                                        Sold Out
                                    </span>
                                ) : tour.sellingFast ? (
                                    <span style={{
                                        display: 'inline-block', padding: '4px 10px', fontSize: '11px',
                                        fontWeight: 700, borderRadius: '6px', backgroundColor: '#fef3c7', color: '#d97706',
                                    }}>
                                        Selling Fast
                                    </span>
                                ) : tour.ticketUrl ? (
                                    <a
                                        href={normalizeExternalUrl(tour.ticketUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-block', padding: '6px 14px', fontSize: '12px',
                                            fontWeight: 600, borderRadius: '6px',
                                            backgroundColor: block.accent || '#3b82f6', color: '#fff',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        Get Tickets
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </BlockWrapper>
    );
};

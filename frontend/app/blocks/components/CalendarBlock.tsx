/**
 * CalendarBlock — renders a mini calendar with booking CTA.
 * Supports integrated booking (calendarUseBooking) or external URL.
 * When using integrated booking, renders a `.custom-booking-block` div
 * that is hydrated by bio-layout.tsx's initBookingWidgets.
 */
import React, { useEffect, useState } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';
import { normalizeExternalUrl } from '~/utils/security';

interface BookingAvailability {
    availability: Record<string, string[]>;
    blockedDates: string[];
    durationMinutes: number;
}

export const CalendarBlock: React.FC<BlockComponentProps> = ({ block, bioId }) => {
    const accentColor = block.calendarAccentColor || block.accent || '#3b82f6';
    const textColor = block.calendarTextColor || block.textColor || '#111827';
    const bgColor = block.calendarColor || '#ffffff';
    const useBooking = block.calendarUseBooking === true;

    const [availability, setAvailability] = useState<BookingAvailability | null>(null);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = now.getDate();

    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Map JS day-of-week (0=Sun) to availability keys
    const dayOfWeekMap: Record<number, string> = {
        0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
    };

    // Fetch booking availability when integrated
    useEffect(() => {
        if (!useBooking || !bioId) return;

        let cancelled = false;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        fetch(`${origin}/api/public/bookings/${bioId}/settings`)
            .then(r => r.json())
            .then(data => {
                if (!cancelled && data) {
                    setAvailability({
                        availability: data.availability || {},
                        blockedDates: data.blockedDates || [],
                        durationMinutes: data.durationMinutes || 30,
                    });
                }
            })
            .catch(() => {});

        return () => { cancelled = true; };
    }, [useBooking, bioId]);

    // Check if a specific day is available for booking
    const isDayAvailable = (day: number): boolean => {
        if (!availability) return false;
        const date = new Date(year, month, day);
        const dayKey = dayOfWeekMap[date.getDay()];
        const slots = availability.availability[dayKey] || [];
        if (slots.length === 0) return false;

        // Check if date is blocked
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (availability.blockedDates.includes(dateStr)) return false;

        // Don't show past days as available
        if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return false;

        return true;
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // When using integrated booking, render ONLY the hookable div —
    // the BookingWidget (hydrated by bio-layout) already has its own full calendar + booking flow.
    if (useBooking && bioId) {
        return (
            <BlockWrapper block={block}>
                <div
                    className="custom-booking-block"
                    data-bio-id={bioId}
                    data-title={block.calendarTitle || 'Agendar horário'}
                    data-description={block.body || ''}
                >
                    {/* Placeholder while hydration runs — shows a loading card */}
                    <div style={{
                        background: bgColor,
                        borderRadius: '24px',
                        padding: '20px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>
                                {block.calendarTitle || 'Agendar horário'}
                            </h3>
                            <span style={{
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                padding: '4px 12px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.05em',
                            }}>Book It</span>
                        </div>
                        <div style={{
                            height: '280px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f9fafb',
                            borderRadius: '16px',
                        }}>
                            <div style={{
                                width: '24px', height: '24px',
                                border: '2px solid #9ca3af',
                                borderTopColor: 'transparent',
                                borderRadius: '9999px',
                                animation: 'spin 0.8s linear infinite',
                            }} />
                        </div>
                    </div>
                </div>
            </BlockWrapper>
        );
    }

    // Non-booking calendar: static mini calendar + optional external link
    return (
        <BlockWrapper block={block}>
            <div style={{
                background: bgColor,
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(0,0,0,0.05)',
            }}>
                {block.calendarTitle && (
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0', textAlign: 'center', color: textColor }}>
                        {block.calendarTitle}
                    </h3>
                )}

                <p style={{ textAlign: 'center', fontWeight: 600, fontSize: '14px', color: textColor, margin: '0 0 8px 0' }}>
                    {monthName}
                </p>

                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                    {dayNames.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#9ca3af', padding: '4px 0' }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                    {cells.map((day, i) => {
                        const isToday = day === today;

                        return (
                            <div
                                key={i}
                                style={{
                                    textAlign: 'center',
                                    padding: '6px 0',
                                    fontSize: '13px',
                                    fontWeight: isToday ? 700 : 400,
                                    color: isToday ? '#fff' : day ? textColor : 'transparent',
                                    backgroundColor: isToday ? accentColor : 'transparent',
                                    borderRadius: '8px',
                                    cursor: 'default',
                                }}
                            >
                                {day || '.'}
                            </div>
                        );
                    })}
                </div>

                {block.calendarUrl && (
                    <a
                        href={normalizeExternalUrl(block.calendarUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '12px',
                            padding: '10px',
                            backgroundColor: accentColor,
                            color: '#fff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                        }}
                    >
                        Book a Time
                    </a>
                )}
            </div>
        </BlockWrapper>
    );
};

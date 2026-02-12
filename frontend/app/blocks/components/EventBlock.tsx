/**
 * EventBlock — renders an event card with a live countdown timer.
 */
import React, { useState, useEffect } from 'react';
import type { BlockComponentProps } from './types';
import { BlockWrapper } from './BlockWrapper';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

const calcTimeLeft = (targetDate: string): TimeLeft => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
    };
};

export const EventBlock: React.FC<BlockComponentProps> = ({ block }) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
        block.eventDate ? calcTimeLeft(block.eventDate) : { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    );

    useEffect(() => {
        if (!block.eventDate) return;
        const timer = setInterval(() => {
            setTimeLeft(calcTimeLeft(block.eventDate!));
        }, 1000);
        return () => clearInterval(timer);
    }, [block.eventDate]);

    const bgColor = block.eventColor || '#111827';
    const textColor = block.eventTextColor || '#ffffff';

    const timerBoxStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        minWidth: '54px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
    };

    const timerNumStyle: React.CSSProperties = {
        fontSize: '26px',
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.5px',
    };

    const timerLabelStyle: React.CSSProperties = {
        fontSize: '10px',
        textTransform: 'uppercase',
        opacity: 0.75,
        marginTop: '4px',
        letterSpacing: '0.5px',
        fontWeight: 600,
    };

    return (
        <BlockWrapper block={block}>
            <div style={{
                background: bgColor,
                color: textColor,
                borderRadius: '24px',
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>
                    {block.eventTitle || block.title || 'Event'}
                </h3>
                {block.eventDate && (
                    <p style={{ fontSize: '13px', opacity: 0.8, margin: '0 0 16px 0' }}>
                        {new Date(block.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                )}

                {!timeLeft.expired ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={timerBoxStyle}>
                            <span style={timerNumStyle}>{timeLeft.days}</span>
                            <span style={timerLabelStyle}>Days</span>
                        </div>
                        <div style={timerBoxStyle}>
                            <span style={timerNumStyle}>{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span style={timerLabelStyle}>Hours</span>
                        </div>
                        <div style={timerBoxStyle}>
                            <span style={timerNumStyle}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span style={timerLabelStyle}>Min</span>
                        </div>
                        <div style={timerBoxStyle}>
                            <span style={timerNumStyle}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span style={timerLabelStyle}>Sec</span>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px 0' }}>Event has started!</p>
                )}

                {block.eventButtonUrl && (
                    <a
                        href={block.eventButtonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            padding: '12px 32px',
                            background: '#ffffff',
                            color: bgColor,
                            borderRadius: '99px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '14px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                            transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            el.style.transform = 'translateY(-2px)';
                            el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
                        }}
                    >
                        {block.eventButtonText || 'Get Tickets'}
                    </a>
                )}
            </div>
        </BlockWrapper>
    );
};

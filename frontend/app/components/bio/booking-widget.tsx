
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore, startOfDay, getDay } from "date-fns";
import { api } from "~/services/api";
import { ChevronLeft, ChevronRight, X, Clock, Calendar, CheckCircle } from "lucide-react";

interface BookingWidgetProps {
    bioId: string;
    triggerElement?: HTMLElement;
    title?: string;
    description?: string;
}

interface TimeSlot {
    time: string; // HH:mm
    available: boolean;
}

interface BookingSettings {
    availability: { [key: string]: string[] };
    blockedDates: string[];
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ bioId, triggerElement, title, description }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'date' | 'time' | 'form' | 'success'>('date');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [slots, setSlots] = useState<string[]>([]);
    const [settings, setSettings] = useState<BookingSettings | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: ""
    });
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Calendar view state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Fetch booking settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get(`/public/bookings/${bioId}/settings`);
                setSettings(res.data);
            } catch (err) {
                console.error("Failed to fetch booking settings:", err);
            }
        };
        fetchSettings();
    }, [bioId]);

    // Helper to check if a day is unavailable
    const isDayUnavailable = (date: Date): boolean => {
        if (!settings) return false;

        // Check if in blocked dates
        const dateStr = format(date, 'yyyy-MM-dd');
        if (settings.blockedDates?.includes(dateStr)) return true;

        // Check if day of week has no availability
        const dayOfWeek = getDay(date); // 0 = Sunday
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayKey = dayNames[dayOfWeek];
        const dayAvailability = settings.availability?.[dayKey];

        // If no time ranges set for this day, it's unavailable
        if (!dayAvailability || dayAvailability.length === 0) return true;

        return false;
    };

    const fetchSlots = async (date: Date) => {
        setLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const res = await api.get(`/public/bookings/${bioId}/slots?date=${dateStr}`);
            setSlots(res.data.slots || []);
            setStep('time');
        } catch (err) {
            console.error(err);
            setError("Failed to load slots. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = async (date: Date) => {
        if (isBefore(date, startOfDay(new Date()))) return;
        setSelectedDate(date);
        await fetchSlots(date);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) return;

        setLoading(true);
        setError("");

        try {
            await api.post(`/public/bookings/${bioId}/book`, {
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                notes: formData.notes
            });

            setStep('success');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to book appointment.");
        } finally {
            setLoading(false);
        }
    };


    // Wrapper to handle selection from inline calendar
    const onDateClick = async (date: Date) => {
        if (isBefore(date, startOfDay(new Date()))) return;
        setIsOpen(true);
        setSelectedDate(date);
        await fetchSlots(date);
    };

    const navBtnStyle: React.CSSProperties = {
        padding: '6px',
        background: 'none',
        border: 'none',
        borderRadius: '9999px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        transition: 'background-color 0.15s',
    };

    // Renders the calendar grid with inline styles
    const renderCalendar = (onDateSelect?: (date: Date) => void) => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDateCal = startOfWeek(monthStart);
        const endDateCal = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows: React.ReactNode[] = [];
        let days: React.ReactNode[] = [];
        let day = startDateCal;

        const clickHandler = onDateSelect || handleDateSelect;

        while (day <= endDateCal) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, startOfDay(new Date()));
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isUnavailable = !isDisabled && isSameMonth(day, monthStart) && isDayUnavailable(day);
                const dayKey = day.toISOString();
                const isHovered = hoveredDay === dayKey && !isDisabled && !isSelected;

                let cellColor = '#111827';
                let cellBg = 'transparent';
                let cellFontWeight: number = 400;
                let cellCursor = 'pointer';

                if (isDisabled) {
                    cellColor = 'rgba(156,163,175,0.3)';
                    cellCursor = 'default';
                } else if (isSelected) {
                    cellBg = '#111827';
                    cellColor = '#fff';
                    cellFontWeight = 600;
                } else if (isUnavailable) {
                    cellColor = 'rgba(156,163,175,0.5)';
                } else if (isHovered) {
                    cellBg = '#f3f4f6';
                }

                days.push(
                    <div
                        key={dayKey}
                        style={{
                            position: 'relative',
                            padding: '4px',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '9999px',
                            fontSize: '14px',
                            cursor: cellCursor,
                            transition: 'all 0.15s',
                            color: cellColor,
                            backgroundColor: cellBg,
                            fontWeight: cellFontWeight,
                            pointerEvents: isDisabled ? 'none' : 'auto',
                        }}
                        onMouseEnter={() => setHoveredDay(dayKey)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDisabled) clickHandler(cloneDay);
                        }}
                    >
                        <span>{formattedDate}</span>
                        {isUnavailable && !isDisabled && (
                            <span style={{
                                position: 'absolute',
                                bottom: '2px',
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#f87171',
                                borderRadius: '9999px',
                            }} />
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        const containerStyle: React.CSSProperties = isOpen ? {
            backgroundColor: '#fff',
            borderRadius: '16px',
        } : {
            backgroundColor: '#fff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        };

        return (
            <div style={containerStyle}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    padding: '0 4px',
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }}
                        style={navBtnStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <ChevronLeft style={{ width: 20, height: 20 }} />
                    </button>
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }}
                        style={navBtnStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <ChevronRight style={{ width: 20, height: 20 }} />
                    </button>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    padding: '0 4px',
                }}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} style={{
                            width: '36px',
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>{d}</div>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{rows}</div>
            </div>
        );
    };

    const inputStyle = (field: string): React.CSSProperties => ({
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: focusedField === field ? '#fff' : '#f3f4f6',
        border: focusedField === field ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
        outline: 'none',
        fontSize: '14px',
        color: '#111827',
        transition: 'all 0.2s',
        boxSizing: 'border-box' as const,
    });

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '11px',
        fontWeight: 700,
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '4px',
    };

    const backBtnStyle: React.CSSProperties = {
        fontSize: '14px',
        color: '#6b7280',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '8px',
        padding: 0,
    };

    const modalContent = (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={() => setIsOpen(false)}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '420px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#ffffff',
                    zIndex: 10,
                    borderBottom: '1px solid #e5e7eb',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '24px 24px 0 0',
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                        {step === 'success' ? 'Confirmed' : title || 'Book Appointment'}
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            padding: '8px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <X style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {step === 'date' && (
                        <div>
                            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>
                                Select a date for your appointment.
                            </p>
                            {renderCalendar()}
                        </div>
                    )}

                    {step === 'time' && (
                        <div>
                            <button onClick={() => setStep('date')} style={backBtnStyle}>
                                <ChevronLeft style={{ width: 16, height: 16 }} /> Back to calendar
                            </button>
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: 700, color: '#111827', fontSize: '18px', margin: '0 0 4px 0' }}>
                                    {format(selectedDate!, 'EEEE, MMMM do')}
                                </h3>
                                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Select a time</p>
                            </div>
                            {loading ? (
                                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{
                                        width: '32px', height: '32px', border: '2px solid #111827',
                                        borderTopColor: 'transparent', borderRadius: '9999px',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                </div>
                            ) : slots.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                                    No slots available on this date.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {slots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => handleTimeSelect(time)}
                                            style={{
                                                padding: '10px 12px',
                                                backgroundColor: hoveredSlot === time ? '#111827' : '#f3f4f6',
                                                color: hoveredSlot === time ? '#fff' : '#111827',
                                                borderRadius: '10px',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                border: '1px solid #e5e7eb',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={() => setHoveredSlot(time)}
                                            onMouseLeave={() => setHoveredSlot(null)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'form' && (
                        <div>
                            <button onClick={() => setStep('time')} style={backBtnStyle}>
                                <ChevronLeft style={{ width: 16, height: 16 }} /> Back to times
                            </button>
                            <div style={{
                                backgroundColor: '#f3f4f6',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                fontSize: '14px',
                                border: '1px solid #e5e7eb',
                            }}>
                                <div style={{ fontWeight: 600, color: '#111827' }}>
                                    {format(selectedDate!, 'EEEE, MMMM do, yyyy')}
                                </div>
                                <div style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <Clock style={{ width: 12, height: 12 }} /> {selectedTime}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={labelStyle}>Name</label>
                                    <input
                                        required
                                        style={inputStyle('name')}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        required
                                        type="email"
                                        style={inputStyle('email')}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={labelStyle}>Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        style={inputStyle('phone')}
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        onFocus={() => setFocusedField('phone')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Notes (Optional)</label>
                                    <textarea
                                        style={{ ...inputStyle('notes'), minHeight: '80px', resize: 'vertical' as const }}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        onFocus={() => setFocusedField('notes')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Anything else we should know?"
                                    />
                                </div>

                                {error && (
                                    <div style={{
                                        color: '#dc2626',
                                        fontSize: '14px',
                                        backgroundColor: 'rgba(220,38,38,0.08)',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        marginBottom: '12px',
                                    }}>{error}</div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        backgroundColor: '#111827',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        border: 'none',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        transition: 'all 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {loading ? (
                                        <div style={{
                                            width: '20px', height: '20px', border: '2px solid #fff',
                                            borderTopColor: 'transparent', borderRadius: '9999px',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                    ) : "Confirm Booking"}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'success' && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <div style={{
                                width: '80px', height: '80px',
                                backgroundColor: '#fef3c7', color: '#d97706',
                                borderRadius: '9999px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}>
                                <Clock style={{ width: 40, height: 40 }} />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                                Almost Done!
                            </h3>
                            <p style={{ color: '#6b7280', maxWidth: '280px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                                We've sent a confirmation email to<br />
                                <strong style={{ color: '#111827' }}>{formData.email}</strong>
                            </p>
                            <div style={{
                                backgroundColor: '#fffbeb',
                                color: '#92400e',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                fontSize: '14px',
                            }}>
                                <strong>Please check your email</strong> and click the confirmation link to complete your booking for <strong>{format(selectedDate!, 'MMMM do')} at {selectedTime}</strong>.
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    padding: '12px 32px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#111827',
                                    fontWeight: 700,
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div style={{ width: '100%', position: 'relative' }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '24px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.2s',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                            {title || "Book a Call"}
                        </h3>
                        <span style={{
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>Book It</span>
                    </div>
                    {description && (
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                            {description}
                        </p>
                    )}

                    {/* Inline Calendar */}
                    {renderCalendar(onDateClick)}
                </div>
            </div>

            {isOpen && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
        </>
    );
};

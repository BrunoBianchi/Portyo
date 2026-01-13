
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

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: ""
    });
    const [error, setError] = useState("");

    // Calendar view state
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
        if (isBefore(date, startOfDay(new Date()))) return; // Disable past dates
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
        // We set step to time immediately
        await fetchSlots(date);
    };

    // Modified renderCalendar to accept an onClick override
    const renderCalendar = (onDateSelect?: (date: Date) => void) => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const clickHandler = onDateSelect || handleDateSelect;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isDisabled = !isSameMonth(day, monthStart) || isBefore(day, startOfDay(new Date()));
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isUnavailable = !isDisabled && isSameMonth(day, monthStart) && isDayUnavailable(day);

                days.push(
                    <div
                        key={day.toString()}
                        className={`relative p-1 w-9 h-9 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all
                            ${isDisabled ? "text-gray-300 pointer-events-none" : "hover:bg-gray-100 text-gray-700"}
                            ${isSelected ? "bg-black text-white hover:bg-black font-semibold" : ""}
                            ${isUnavailable && !isSelected ? "text-gray-400" : ""}
                        `}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDisabled) clickHandler(cloneDay);
                        }}
                    >
                        <span>{formattedDate}</span>
                        {isUnavailable && !isDisabled && (
                            <span className="absolute bottom-0.5 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="flex justify-between items-center" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className={`bg-white rounded-2xl ${!isOpen ? 'border border-gray-100 p-4 shadow-sm' : ''}`}>
                <div className="flex items-center justify-between mb-4 px-1">
                    <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-bold text-gray-900">{format(currentMonth, "MMMM yyyy")}</span>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
                <div className="flex justify-between mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="w-9 text-center">{d}</div>)}
                </div>
                <div className="space-y-1">{rows}</div>
            </div>
        );
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 border-b p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        {step === 'success' ? 'Confirmed' : title || 'Book Appointment'}
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'date' && (
                        <div className="space-y-4">
                            <p className="text-gray-600 text-sm text-center">Select a date for your appointment.</p>
                            {renderCalendar()}
                        </div>
                    )}

                    {step === 'time' && (
                        <div className="space-y-4">
                            <button onClick={() => setStep('date')} className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-2">
                                <ChevronLeft className="w-4 h-4" /> Back to calendar
                            </button>
                            <div className="text-center">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{format(selectedDate!, 'EEEE, MMMM do')}</h3>
                                <p className="text-gray-500 text-sm">Select a time</p>
                            </div>
                            {loading ? (
                                <div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div></div>
                            ) : slots.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No slots available on this date.</div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => handleTimeSelect(time)}
                                            className="py-2 px-3 bg-gray-50 hover:bg-black hover:text-white rounded-lg text-sm font-medium transition-colors border border-gray-100"
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="space-y-4">
                            <button onClick={() => setStep('time')} className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-2">
                                <ChevronLeft className="w-4 h-4" /> Back to times
                            </button>
                            <div className="bg-gray-50 p-4 rounded-xl mb-4 text-sm border border-gray-100">
                                <div className="font-semibold text-gray-900">{format(selectedDate!, 'EEEE, MMMM do, yyyy')}</div>
                                <div className="text-gray-600 flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3" /> {selectedTime}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Name</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black/10 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black/10 outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black/10 outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notes (Optional)</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black/10 outline-none transition-all min-h-[80px]"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Anything else we should know?"
                                    />
                                </div>

                                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : "Confirm Booking"}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8 animate-in zoom-in-50 duration-300">
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mb-4">
                                We've sent a confirmation email to<br />
                                <strong className="text-gray-900">{formData.email}</strong>
                            </p>
                            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl mb-6 text-sm">
                                <strong>Please check your email</strong> and click the confirmation link to complete your booking for <strong>{format(selectedDate!, 'MMMM do')} at {selectedTime}</strong>.
                            </div>
                            <button onClick={() => setIsOpen(false)} className="px-8 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200 transition-colors">
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
            <div className="w-full relative group">
                <div className="bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{title || "Book a Call"}</h3>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Book It</span>
                    </div>
                    {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}

                    {/* Inline Calendar */}
                    {renderCalendar(onDateClick)}
                </div>
            </div>

            {isOpen && createPortal(modalContent, document.body)}
        </>
    );
};

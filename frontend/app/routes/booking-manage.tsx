import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { api } from "../services/api";
import { format, addDays, startOfDay, isBefore, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth } from "date-fns";
import { Calendar, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, X } from "lucide-react";

interface BookingInfo {
    id: string;
    customerName: string;
    customerEmail: string;
    bookingDate: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    notes: string | null;
    bioName: string;
    bioId?: string;
}

export default function BookingManage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [booking, setBooking] = useState<BookingInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [showCancelReason, setShowCancelReason] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    // Reschedule state
    const [showReschedule, setShowReschedule] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
    const [rescheduleTime, setRescheduleTime] = useState("");
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (!token) {
            setError("No booking token provided.");
            setLoading(false);
            return;
        }
        fetchBooking();
    }, [token]);

    const fetchBooking = async () => {
        try {
            const res = await api.get(`/public/bookings/manage/${token}`);
            setBooking(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load booking.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setActionLoading(true);
        setError("");
        try {
            await api.post(`/public/bookings/confirm/${token}`);
            await fetchBooking();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to confirm booking.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        setActionLoading(true);
        setError("");
        try {
            await api.post(`/public/bookings/cancel/${token}`, { reason: cancelReason });
            await fetchBooking();
            setShowCancelReason(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to cancel booking.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleDate || !rescheduleTime) {
            setError("Please select a new date and time.");
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            await api.post(`/public/bookings/reschedule/${token}`, {
                date: format(rescheduleDate, 'yyyy-MM-dd'),
                time: rescheduleTime,
                selfReschedule: true
            });
            await fetchBooking();
            setShowReschedule(false);
            setRescheduleDate(null);
            setRescheduleTime("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reschedule booking.");
        } finally {
            setActionLoading(false);
        }
    };

    const fetchSlots = async (date: Date) => {
        if (!booking?.bioId) return;
        setLoadingSlots(true);
        try {
            const res = await api.get(`/public/bookings/${booking.bioId}/slots?date=${format(date, 'yyyy-MM-dd')}`);
            setAvailableSlots(res.data.slots || []);
        } catch (err) {
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleDateSelect = (date: Date) => {
        setRescheduleDate(date);
        setRescheduleTime("");
        fetchSlots(date);
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        const days: React.ReactNode[] = [];
        let day = calendarStart;

        while (day <= calendarEnd) {
            const currentDay = day;
            const isDisabled = isBefore(currentDay, startOfDay(new Date()));
            const isSelected = rescheduleDate ? isSameDay(currentDay, rescheduleDate) : false;
            const isCurrentMonth = isSameMonth(currentDay, monthStart);

            days.push(
                <div
                    key={currentDay.toString()}
                    className={`p-1 w-9 h-9 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all
                        ${!isCurrentMonth ? "opacity-30" : ""}
                        ${isDisabled ? "text-gray-300 pointer-events-none" : "hover:bg-[#1e3a5f]/10 text-gray-700"}
                        ${isSelected ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f] font-semibold" : ""}
                    `}
                    onClick={() => !isDisabled && handleDateSelect(currentDay)}
                >
                    {format(currentDay, 'd')}
                </div>
            );
            day = addDays(day, 1);
        }

        return (
            <div className="bg-white rounded-2xl">
                <div className="flex items-center justify-between mb-4 px-1">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="font-bold text-gray-900">{format(currentMonth, "MMMM yyyy")}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="grid grid-cols-7 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-center">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">{days}</div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1e3a5f] border-t-transparent"></div>
            </div>
        );
    }

    if (error && !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!booking) return null;

    const bookingDate = new Date(booking.bookingDate);
    const isPending = booking.status === "pending";
    const isConfirmed = booking.status === "confirmed";
    const isCancelled = booking.status === "cancelled";

    const getHeaderStyle = () => {
        if (isCancelled) return 'bg-gradient-to-br from-red-500 to-red-600';
        if (isPending) return 'bg-gradient-to-br from-amber-500 to-orange-500';
        return 'bg-gradient-to-br from-emerald-500 to-green-600';
    };

    const getStatusIcon = () => {
        if (isCancelled) return <XCircle className="w-8 h-8" />;
        if (isPending) return <Clock className="w-8 h-8" />;
        return <CheckCircle className="w-8 h-8" />;
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Status Header */}
                    <div className={`p-8 text-white ${getHeaderStyle()}`}>
                        <div className="flex items-center gap-3 mb-3">
                            {getStatusIcon()}
                            <h1 className="text-2xl font-bold">
                                {isCancelled ? 'Booking Cancelled' :
                                    isPending ? 'Confirm Your Booking' :
                                        'Booking Confirmed'}
                            </h1>
                        </div>
                        <p className="opacity-90 text-white/80">
                            {isCancelled ? 'This appointment has been cancelled.' :
                                isPending ? 'Please confirm your appointment below.' :
                                    'Your appointment is scheduled.'}
                        </p>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6 space-y-5">
                        {/* Date & Time Card */}
                        <div className="bg-[#fef9f3] rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                    <Calendar className="w-6 h-6 text-[#1e3a5f]" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</p>
                                    <p className="font-bold text-gray-900 text-lg">{format(bookingDate, 'EEEE, MMMM do, yyyy')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                    <Clock className="w-6 h-6 text-[#1e3a5f]" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time</p>
                                    <p className="font-bold text-gray-900 text-lg">{format(bookingDate, 'h:mm a')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Booked With */}
                        <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {booking.bioName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Booked with</p>
                                <p className="font-bold text-gray-900 text-lg">{booking.bioName}</p>
                            </div>
                        </div>

                        {/* Your Details */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your Details</p>
                            <p className="font-semibold text-gray-900">{booking.customerName}</p>
                            <p className="text-gray-600 text-sm">{booking.customerEmail}</p>
                        </div>

                        {booking.notes && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                                <p className="text-gray-700">{booking.notes}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Actions for Pending */}
                        {isPending && (
                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={handleConfirm}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/25"
                                >
                                    {actionLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Confirm Booking
                                        </>
                                    )}
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowReschedule(true)}
                                        className="flex-1 py-3 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={() => setShowCancelReason(true)}
                                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions for Confirmed */}
                        {isConfirmed && (
                            <div className="space-y-4 pt-2">
                                <div className="bg-emerald-50 text-emerald-700 p-5 rounded-2xl text-center border border-emerald-100">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                    <p className="font-bold text-lg">Your booking is confirmed!</p>
                                    <p className="text-sm text-emerald-600/80">We look forward to seeing you.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowReschedule(true)}
                                        className="flex-1 py-3 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={() => setShowCancelReason(true)}
                                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Cancelled Status */}
                        {isCancelled && (
                            <div className="bg-red-50 text-red-700 p-5 rounded-2xl text-center border border-red-100">
                                <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                                <p className="font-bold text-lg">This booking has been cancelled.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    Powered by <span className="font-semibold text-gray-600">Portyo</span>
                </p>
            </div>

            {/* Reschedule Modal */}
            {showReschedule && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Reschedule Booking</h3>
                            <button onClick={() => setShowReschedule(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">Select a new date and time for your appointment.</p>

                        {/* Calendar */}
                        <div className="mb-6 border border-gray-100 rounded-2xl p-4">
                            {renderCalendar()}
                        </div>

                        {/* Time Slots */}
                        {rescheduleDate && (
                            <div className="mb-6">
                                <p className="text-sm font-bold text-gray-700 mb-3">
                                    Available times for {format(rescheduleDate, 'MMMM d')}:
                                </p>
                                {loadingSlots ? (
                                    <div className="flex justify-center py-6">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1e3a5f] border-t-transparent"></div>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-6 bg-gray-50 rounded-xl">No available slots for this date.</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setRescheduleTime(slot)}
                                                className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all ${rescheduleTime === slot
                                                    ? 'bg-[#1e3a5f] text-white shadow-lg'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReschedule(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReschedule}
                                disabled={actionLoading || !rescheduleDate || !rescheduleTime}
                                className="flex-1 py-3 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? "Rescheduling..." : "Confirm New Time"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelReason && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to cancel this appointment?</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation (optional)"
                            className="w-full p-4 border border-gray-200 rounded-2xl mb-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/30 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelReason(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={actionLoading}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? "Cancelling..." : "Cancel Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

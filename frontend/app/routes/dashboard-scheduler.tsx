import { useState, useEffect, useContext, useMemo } from "react";
import BioContext from "../contexts/bio.context";
import { api } from "../services/api";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, Ban, Save, Loader2, PauseCircle, PlayCircle, ChevronLeft, ChevronRight, Check, X, ShieldAlert, Plus, RefreshCw, CalendarCheck } from "lucide-react";
import { AuthorizationGuard } from "../contexts/guard.context";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

export default function DashboardScheduler() {
    const { t } = useTranslation();
    const { bio } = useContext(BioContext);
    const [activeTab, setActiveTab] = useState<'today' | 'bookings' | 'availability'>('today');
    const [settings, setSettings] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Pagination & Filter State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'cancelled'
    const limit = 5; // Items per page

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Filter Date State
    const [filterDate, setFilterDate] = useState<string>("");

    // Reschedule Modal State
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
    const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
    const [rescheduleTime, setRescheduleTime] = useState("");
    const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);
    const [rescheduleMonth, setRescheduleMonth] = useState(new Date());

    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const isMobile = useIsMobile();
    const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:scheduler-tour-done" });

    useEffect(() => {
        if (bio?.id) {
            fetchData();
        }
    }, [bio?.id, currentPage, filterStatus, activeTab, filterDate]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:scheduler-tour-done");
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour(schedulerTourSteps);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMobile, startTour]);

    const schedulerTourSteps: DriveStep[] = useMemo(() => [
        {
            element: "[data-tour=\"scheduler-header\"]",
            popover: { title: t("dashboard.tours.scheduler.steps.header"), description: t("dashboard.tours.scheduler.steps.header"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"scheduler-status\"]",
            popover: { title: t("dashboard.tours.scheduler.steps.status"), description: t("dashboard.tours.scheduler.steps.status"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"scheduler-tabs\"]",
            popover: { title: t("dashboard.tours.scheduler.steps.tabs"), description: t("dashboard.tours.scheduler.steps.tabs"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"scheduler-filters\"]",
            popover: { title: t("dashboard.tours.scheduler.steps.filters"), description: t("dashboard.tours.scheduler.steps.filters"), side: "bottom", align: "start" },
        },
        {
            element: "[data-tour=\"scheduler-bookings\"]",
            popover: { title: t("dashboard.tours.scheduler.steps.bookings"), description: t("dashboard.tours.scheduler.steps.bookings"), side: "top", align: "start" },
        },
        {
            element: "[data-tour=\"scheduler-availability\"]",
            popover: { title: t("dashboard.tours.scheduler.steps.availability"), description: t("dashboard.tours.scheduler.steps.availability"), side: "top", align: "start" },
        },
        {
            element: "[data-tour=\"scheduler-blocked\"]",
            popover: { title: t("dashboard.tours.scheduler.steps.blocked"), description: t("dashboard.tours.scheduler.steps.blocked"), side: "top", align: "start" },
        },
    ], [t]);


    const fetchData = async () => {
        setLoading(true);
        try {
            let url = `/bookings/${bio?.id}?page=${currentPage}&limit=${limit}`;

            if (activeTab === 'today') {
                url += `&date=${format(new Date(), 'yyyy-MM-dd')}`;
                url += `&status=${filterStatus}`;
            } else {
                url += `&status=${filterStatus}`;
                if (filterDate) {
                    url += `&date=${filterDate}`;
                }
            }

            const promises: Promise<any>[] = [
                api.get(url)
            ];

            if (!settings) {
                promises.unshift(api.get(`/bookings/settings/${bio?.id}`));
            }

            const results = await Promise.all(promises);

            if (!settings) {
                const settingsRes = results[0];
                const bookingsRes = results[1];

                const loadedSettings = settingsRes.data;
                if (!loadedSettings.blockedDates) loadedSettings.blockedDates = [];
                setSettings(loadedSettings);

                setBookings(bookingsRes.data.bookings || []);
                setTotalPages(bookingsRes.data.totalPages || 1);
            } else {
                const bookingsRes = results[0];
                setBookings(bookingsRes.data.bookings || []);
                setTotalPages(bookingsRes.data.totalPages || 1);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!bio?.id) return;
        setSaving(true);
        try {
            await api.put(`/bookings/settings/${bio?.id}`, settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            alert(t("dashboard.scheduler.errors.saveSettings"));
        } finally {
            setSaving(false);
        }
    };

    const togglePause = async () => {
        const newStatus = !settings.updatesPaused;
        setSettings({ ...settings, updatesPaused: newStatus });
    };

    // --- Availability Logic ---

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

    const updateAvailability = (day: string, type: 'start' | 'end' | 'active', val?: string) => {
        const current = settings.availability[day]?.[0] || ""; // Format: "09:00-17:00"
        let [start, end] = current.split("-");

        // If enabling, set default
        if (type === 'active' && !current) {
            const newAvailability = { ...settings.availability };
            newAvailability[day] = ["09:00-17:00"];
            setSettings({ ...settings, availability: newAvailability });
            return;
        }

        // If disabling
        if (type === 'active' && current) {
            const newAvailability = { ...settings.availability };
            newAvailability[day] = [];
            setSettings({ ...settings, availability: newAvailability });
            return;
        }

        if (!start) start = "09:00";
        if (!end) end = "17:00";

        if (type === 'start') start = val || "09:00";
        if (type === 'end') end = val || "17:00";

        const newStr = `${start}-${end}`;
        const newAvailability = { ...settings.availability };
        newAvailability[day] = [newStr];
        setSettings({ ...settings, availability: newAvailability });
    };

    // --- Blocked Dates Logic ---

    const toggleBlockedDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const blocked = settings.blockedDates || [];

        let newBlocked;
        if (blocked.includes(dateStr)) {
            newBlocked = blocked.filter((d: string) => d !== dateStr);
        } else {
            newBlocked = [...blocked, dateStr];
        }

        setSettings({ ...settings, blockedDates: newBlocked });
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="bg-white rounded-[24px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 select-none">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-black" /></button>
                    <span className="font-black text-[#1A1A1A] text-lg" style={{ fontFamily: 'var(--font-display)' }}>{format(currentMonth, "MMMM yyyy")}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-black" /></button>
                </div>

                <div className="grid grid-cols-7 mb-4">
                    {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map(d => (
                        <div key={d} className="text-center text-xs font-black text-gray-400 uppercase tracking-wider">{t(`dashboard.scheduler.weekdaysShort.${d}`)}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isBlocked = settings?.blockedDates?.includes(dateStr);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isPast = isBefore(day, startOfDay(new Date()));

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => !isPast && toggleBlockedDate(day)}
                                className={`
                                    aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all cursor-pointer relative border-2
                                    ${!isCurrentMonth ? 'opacity-20 border-transparent' : ''}
                                    ${isPast ? 'opacity-30 cursor-not-allowed bg-gray-50 border-transparent text-gray-400' : ''}
                                    ${isBlocked
                                        ? 'bg-red-50 text-red-500 border-red-200 shadow-sm' // Blocked State
                                        : !isPast && isCurrentMonth ? 'bg-white border-gray-100 hover:border-black text-[#1A1A1A]' : '' // Available State
                                    }
                                `}
                            >
                                {format(day, 'd')}
                                {isBlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Ban className="w-5 h-5 opacity-30" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-500 justify-center">
                    <div className="w-3 h-3 rounded-md bg-red-50 border border-red-200"></div>
                    <span>{t("dashboard.scheduler.blockedDate")}</span>
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-black w-8 h-8" /></div>;

    return (
        <AuthorizationGuard minPlan="standard">
            <div className="p-8 max-w-6xl mx-auto font-sans">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" data-tour="scheduler-header">
                    <div>
                        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.scheduler.title")}</h1>
                        <p className="text-gray-600 mt-2 font-medium">{t("dashboard.scheduler.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-3" data-tour="scheduler-status">
                        {settings && (
                            <button
                                onClick={togglePause}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${settings.updatesPaused
                                    ? 'bg-amber-100 text-amber-800 border-black'
                                    : 'bg-green-100 text-green-800 border-black'}`}
                            >
                                {settings.updatesPaused ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                {settings.updatesPaused ? t("dashboard.scheduler.status.paused") : t("dashboard.scheduler.status.active")}
                            </button>
                        )}
                        {activeTab === 'availability' && (
                            <button
                                id="save-button"
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl font-black text-sm border-2 border-black hover:bg-[#333] transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-[2px_2px_0px_0px_rgba(198,240,53,1)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                            >
                                {saved ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        {t("dashboard.scheduler.save.saved")}
                                    </>
                                ) : saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("dashboard.scheduler.save.saving")}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {t("dashboard.scheduler.save.action")}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-[600px] flex flex-col">
                    <div className="border-b-2 border-gray-100 px-8 flex gap-8" data-tour="scheduler-tabs">
                        <button
                            onClick={() => { setActiveTab('today'); setCurrentPage(1); }}
                            className={`py-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'today' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                        >
                            <CalendarCheck className="w-4 h-4" />
                            {t("dashboard.scheduler.tabs.today")}
                        </button>
                        <button
                            onClick={() => { setActiveTab('bookings'); setCurrentPage(1); }}
                            className={`py-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            {t("dashboard.scheduler.tabs.bookings")}
                        </button>
                        <button
                            onClick={() => setActiveTab('availability')}
                            className={`py-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'availability' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                        >
                            <Clock className="w-4 h-4" />
                            {t("dashboard.scheduler.tabs.availability")}
                        </button>
                    </div>

                    <div className="p-8 flex-1 bg-[#FAFAFA]">
                        {activeTab === 'today' || activeTab === 'bookings' ? (
                            <div className="space-y-6 max-w-4xl mx-auto">

                                {/* Filter Tabs */}
                                {(activeTab === 'bookings' || activeTab === 'today') && (
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center" data-tour="scheduler-filters">
                                        <div className="flex gap-2 p-1 bg-white rounded-xl border-2 border-gray-100 w-fit flex-wrap">
                                            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterStatus(status);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-xs font-black capitalize transition-all ${filterStatus === status
                                                        ? 'bg-black text-white'
                                                        : 'text-gray-500 hover:text-black'
                                                        }`}
                                                >
                                                    {t(`dashboard.scheduler.status.${status}`)}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Date Filter Input */}
                                        {activeTab === 'bookings' && (
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterDate}
                                                        onChange={(e) => {
                                                            setFilterDate(e.target.value);
                                                            setCurrentPage(1);
                                                        }}
                                                        className="pl-9 pr-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold focus:ring-0 focus:border-black outline-none shadow-sm text-[#1A1A1A]"
                                                    />
                                                    <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                                {filterDate && (
                                                    <button
                                                        onClick={() => setFilterDate("")}
                                                        className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                                        title={t("dashboard.scheduler.clearDate")}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Booking List */}
                                <div className="space-y-4 min-h-[400px]" data-tour="scheduler-bookings">
                                    {bookings.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border-2 border-gray-100 flex items-center justify-center mb-6">
                                                <CalendarIcon className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h3 className="font-black text-[#1A1A1A] text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>{activeTab === 'today' ? t("dashboard.scheduler.empty.todayTitle") : t("dashboard.scheduler.empty.title")}</h3>
                                            <p className="max-w-xs text-center text-sm font-medium">{activeTab === 'today' ? t("dashboard.scheduler.empty.todayBody") : t("dashboard.scheduler.empty.body")}</p>
                                        </div>
                                    ) : (
                                        bookings.map((booking: any) => {
                                            const statusColors: Record<string, string> = {
                                                pending: 'bg-amber-100 text-amber-700 border-amber-200',
                                                confirmed: 'bg-green-100 text-green-700 border-green-200',
                                                cancelled: 'bg-red-50 text-red-500 border-red-200',
                                                completed: 'bg-blue-100 text-blue-700 border-blue-200'
                                            };
                                            const isCancelled = booking.status === 'cancelled';

                                            return (
                                                <div key={booking.id} className={`bg-white p-6 rounded-[24px] border-2 border-gray-100 hover:border-black shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${isCancelled ? 'opacity-60' : ''}`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className={`bg-[#F3F3F1] text-[#1A1A1A] border-2 border-black px-4 py-3 rounded-xl text-center min-w-[80px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] `}>
                                                            <div className="text-2xl font-black">{format(parseISO(booking.bookingDate), 'd')}</div>
                                                            <div className="text-[10px] uppercase font-black tracking-wider text-gray-500 mt-0.5">{format(parseISO(booking.bookingDate), 'MMM')}</div>
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                                                <h3 className={`font-black text-lg ${isCancelled ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'}`} style={{ fontFamily: 'var(--font-display)' }}>{booking.customerName}</h3>
                                                                <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] uppercase font-black tracking-wide ${statusColors[booking.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>{t(`dashboard.scheduler.status.${booking.status}`)}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 font-bold">
                                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {format(parseISO(booking.bookingDate), 'h:mm a')}</span>
                                                                <span className="hidden sm:inline text-gray-300">•</span>
                                                                <span>{booking.customerEmail}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions - Only if not cancelled & has token */}
                                                    {!isCancelled && booking.confirmationToken && (
                                                        <div className="flex items-center gap-2 self-start sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setRescheduleBooking(booking);
                                                                    setRescheduleDate(null);
                                                                    setRescheduleTime("");
                                                                    setRescheduleSlots([]);
                                                                    setRescheduleModalOpen(true);
                                                                }}
                                                                className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 rounded-xl text-xs font-bold transition-all"
                                                            >
                                                                {t("dashboard.scheduler.actions.reschedule")}
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm(t("dashboard.scheduler.actions.confirmCancel"))) return;
                                                                    try {
                                                                        await api.post(`/public/bookings/cancel/${booking.confirmationToken}`, { reason: 'Cancelled by owner' });
                                                                        fetchData();
                                                                    } catch (err) {
                                                                        alert(t("dashboard.scheduler.errors.cancel"));
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-xl text-xs font-bold transition-all"
                                                            >
                                                                {t("dashboard.scheduler.actions.cancel")}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> {t("dashboard.scheduler.pagination.previous")}
                                        </button>
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                            {t("dashboard.scheduler.pagination.pageOf", { page: currentPage, totalPages })}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {t("dashboard.scheduler.pagination.next")} <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Weekly Schedule */}
                                <div className="lg:col-span-2 space-y-8">
                                    <section className="bg-white p-8 rounded-[24px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" data-tour="scheduler-availability">
                                        <h3 className="font-black text-[#1A1A1A] mb-8 flex items-center gap-3 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                                            <div className="p-2 bg-indigo-100 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-indigo-600">
                                                <Clock className="w-5 h-5" strokeWidth={3} />
                                            </div>
                                            {t("dashboard.scheduler.weeklySchedule.title")}
                                        </h3>
                                        <div className="space-y-4">
                                            {settings && days.map(day => {
                                                const schedule = settings.availability?.[day]?.[0];
                                                const isActive = !!schedule;
                                                const [start, end] = schedule ? schedule.split('-') : ["09:00", "17:00"];

                                                return (
                                                    <div key={day} className={`flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${isActive ? 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-[#F3F3F1] border-transparent opacity-80'}`}>
                                                        <div className="flex items-center gap-5">
                                                            <button
                                                                onClick={() => updateAvailability(day, 'active')}
                                                                className={`w-14 h-8 rounded-full transition-all relative border-2 border-black ${isActive ? 'bg-[#C6F035]' : 'bg-gray-200'}`}
                                                            >
                                                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white border-2 border-black rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                                            </button>
                                                            <span className="font-black capitalize text-[#1A1A1A] w-20 text-lg">{t(`dashboard.scheduler.days.${day}`)}</span>
                                                        </div>

                                                        {isActive ? (
                                                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                                                                <div className="relative">
                                                                    <input
                                                                        type="time"
                                                                        value={start}
                                                                        onChange={(e) => updateAvailability(day, 'start', e.target.value)}
                                                                        className="pl-3 pr-2 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:ring-0 focus:border-black outline-none transition-colors"
                                                                    />
                                                                </div>
                                                                <span className="text-gray-400 font-bold">-</span>
                                                                <div className="relative">
                                                                    <input
                                                                        type="time"
                                                                        value={end}
                                                                        onChange={(e) => updateAvailability(day, 'end', e.target.value)}
                                                                        className="pl-3 pr-2 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:ring-0 focus:border-black outline-none transition-colors"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-400 italic px-4">{t("dashboard.scheduler.weeklySchedule.unavailable")}</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: General Settings & Blocked Dates */}
                                <div className="space-y-8">
                                    {/* Google Calendar Integration */}
                                    <section className={`p-6 rounded-[24px] border-2 transition-all ${bio?.integrations?.some((i: any) => i.name === 'google-calendar')
                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                        : 'bg-white border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}>

                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className={`font-black text-lg flex items-center gap-2 ${bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? 'text-green-800' : 'text-[#1A1A1A]'}`} style={{ fontFamily: 'var(--font-display)' }}>
                                                <CalendarIcon className={`w-5 h-5 ${bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? 'text-green-600' : 'text-blue-600'}`} strokeWidth={2.5} />
                                                Google Calendar
                                            </h3>
                                            {bio?.integrations?.some((i: any) => i.name === 'google-calendar') && (
                                                <span className="px-3 py-1 bg-green-100 border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                    {t("dashboard.scheduler.googleCalendar.active")}
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-sm mb-6 font-medium ${bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? 'text-green-700' : 'text-gray-500'}`}>
                                            {bio?.integrations?.some((i: any) => i.name === 'google-calendar')
                                                ? t("dashboard.scheduler.googleCalendar.connected")
                                                : t("dashboard.scheduler.googleCalendar.disconnected")}
                                        </p>

                                        <button
                                            onClick={() => {
                                                window.open(`${api.defaults.baseURL}/google-calendar/auth/${bio?.id}`, '_blank', 'width=500,height=600');
                                            }}
                                            className={`w-full py-3 font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${bio?.integrations?.some((i: any) => i.name === 'google-calendar')
                                                ? 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white border-black'
                                                }`}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            {bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? t("dashboard.scheduler.googleCalendar.reconnect") : t("dashboard.scheduler.googleCalendar.connect")}
                                        </button>
                                    </section>

                                    <section className="bg-white p-8 rounded-[24px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" data-tour="scheduler-blocked">
                                        <h3 className="font-black text-[#1A1A1A] mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                                            <ShieldAlert className="w-5 h-5 text-red-500" />
                                            {t("dashboard.scheduler.blockedDates.title")}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6 font-medium">{t("dashboard.scheduler.blockedDates.subtitle")}</p>
                                        {renderCalendar()}
                                    </section>

                                    <section className="bg-amber-50 p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <h3 className="font-black text-[#1A1A1A] mb-3 text-lg" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.scheduler.meetingDuration.title")}</h3>
                                        <div className="relative">
                                            <select
                                                value={settings?.durationMinutes || 30}
                                                onChange={(e) => setSettings({ ...settings, durationMinutes: parseInt(e.target.value) })}
                                                className="w-full bg-white border-2 border-black text-[#1A1A1A] font-bold rounded-xl p-3 outline-none focus:ring-0 appearance-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                                            >
                                                <option value="15">{t("dashboard.scheduler.meetingDuration.minutes", { count: 15 })}</option>
                                                <option value="30">{t("dashboard.scheduler.meetingDuration.minutes", { count: 30 })}</option>
                                                <option value="45">{t("dashboard.scheduler.meetingDuration.minutes", { count: 45 })}</option>
                                                <option value="60">{t("dashboard.scheduler.meetingDuration.minutes", { count: 60 })}</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reschedule Modal */}
            {rescheduleModalOpen && rescheduleBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.scheduler.reschedule.title")}</h3>
                            <button onClick={() => setRescheduleModalOpen(false)} className="p-2 hover:bg-black hover:text-white rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-[#F3F3F1] border-2 border-black rounded-xl p-4 mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-sm font-bold text-[#1A1A1A]">
                                {t("dashboard.scheduler.reschedule.for", { name: rescheduleBooking.customerName })}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">{rescheduleBooking.customerEmail}</p>
                        </div>

                        <p className="text-gray-500 font-medium text-sm mb-4">{t("dashboard.scheduler.reschedule.helper")}</p>

                        {/* Calendar */}
                        <div className="mb-6 border-2 border-gray-200 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => setRescheduleMonth(subMonths(rescheduleMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                                </button>
                                <span className="font-black text-[#1A1A1A]">{format(rescheduleMonth, "MMMM yyyy")}</span>
                                <button onClick={() => setRescheduleMonth(addMonths(rescheduleMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full">
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 mb-2 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map(d => <div key={d} className="text-center">{t(`dashboard.scheduler.weekdaysShort.${d}`)}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {(() => {
                                    const monthStart = startOfMonth(rescheduleMonth);
                                    const monthEnd = endOfMonth(monthStart);
                                    const calendarStart = startOfWeek(monthStart);
                                    const calendarEnd = endOfWeek(monthEnd);
                                    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

                                    return calendarDays.map(day => {
                                        const isDisabled = isBefore(day, startOfDay(new Date()));
                                        const isSelected = rescheduleDate ? isSameDay(day, rescheduleDate) : false;
                                        const isCurrentMonth = isSameMonth(day, monthStart);

                                        return (
                                            <div
                                                key={day.toString()}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    setRescheduleDate(day);
                                                    setRescheduleTime("");
                                                    // Fetch slots
                                                    setRescheduleSlotsLoading(true);
                                                    api.get(`/public/bookings/${bio?.id}/slots?date=${format(day, 'yyyy-MM-dd')}`)
                                                        .then(res => setRescheduleSlots(res.data.slots || []))
                                                        .catch(() => setRescheduleSlots([]))
                                                        .finally(() => setRescheduleSlotsLoading(false));
                                                }}
                                                className={`
                                                    p-1 w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition-all border
                                                    ${!isCurrentMonth ? "opacity-30 border-transparent" : ""}
                                                    ${isDisabled ? "text-gray-300 pointer-events-none border-transparent" : "hover:bg-gray-100 text-gray-600 border-transparent"}
                                                    ${isSelected ? "bg-black text-white hover:bg-black/90 !border-black" : ""}
                                                `}
                                            >
                                                {format(day, 'd')}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Time Slots */}
                        {rescheduleDate && (
                            <div className="mb-6">
                                <p className="text-sm font-black text-[#1A1A1A] mb-3">
                                    {t("dashboard.scheduler.reschedule.availableTimes", { date: format(rescheduleDate, 'MMMM d') })}
                                </p>
                                {rescheduleSlotsLoading ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                ) : rescheduleSlots.length === 0 ? (
                                    <p className="text-gray-500 font-medium text-sm text-center py-6 bg-gray-50 rounded-xl">{t("dashboard.scheduler.reschedule.noSlots")}</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {rescheduleSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setRescheduleTime(slot)}
                                                className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all border-2 ${rescheduleTime === slot
                                                    ? 'bg-[#C6F035] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'bg-white border-gray-200 hover:border-black text-gray-600'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setRescheduleModalOpen(false)}
                                className="flex-1 py-3 bg-white border-2 border-gray-200 hover:border-black text-gray-500 hover:text-black font-bold rounded-xl transition-all"
                            >
                                {t("dashboard.scheduler.reschedule.cancel")}
                            </button>
                            <button
                                onClick={async () => {
                                    if (!rescheduleDate || !rescheduleTime || !rescheduleBooking?.confirmationToken) return;
                                    setRescheduleLoading(true);
                                    try {
                                        const dateTime = `${format(rescheduleDate, 'yyyy-MM-dd')}T${rescheduleTime}`;
                                        await api.post(`/public/bookings/reschedule/${rescheduleBooking.confirmationToken}`, {
                                            newDate: dateTime
                                        });
                                        setRescheduleModalOpen(false);
                                        fetchData();
                                        alert(t("dashboard.scheduler.reschedule.success"));
                                    } catch (err: any) {
                                        alert(err.response?.data?.message || t("dashboard.scheduler.reschedule.error"));
                                    } finally {
                                        setRescheduleLoading(false);
                                    }
                                }}
                                disabled={!rescheduleDate || !rescheduleTime || rescheduleLoading}
                                className="flex-1 py-3 bg-black text-white border-2 border-black font-bold rounded-xl hover:bg-[#333] transition-all shadow-[4px_4px_0px_0px_rgba(198,240,53,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:shadow-none disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {rescheduleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("dashboard.scheduler.reschedule.confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthorizationGuard>
    );
}

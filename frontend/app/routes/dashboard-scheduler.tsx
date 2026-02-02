import { useState, useEffect, useContext } from "react";
import BioContext from "../contexts/bio.context";
import { api } from "../services/api";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, Ban, Save, Loader2, PauseCircle, PlayCircle, ChevronLeft, ChevronRight, Check, X, ShieldAlert, Plus, RefreshCw, CalendarCheck } from "lucide-react";
import { AuthorizationGuard } from "../contexts/guard.context";
import { useTranslation } from "react-i18next";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useJoyrideSettings } from "~/utils/joyride";

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

    const [tourRun, setTourRun] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
    const { isMobile, styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);

    useEffect(() => {
        if (bio?.id) {
            fetchData();
        }
    }, [bio?.id, currentPage, filterStatus, activeTab, filterDate]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMobile) return;

        const hasSeenTour = window.localStorage.getItem("portyo:scheduler-tour-done");
        if (!hasSeenTour) {
            setTourRun(true);
        }

        const rootStyles = getComputedStyle(document.documentElement);
        const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
        if (primaryFromTheme) {
            setTourPrimaryColor(primaryFromTheme);
        }
    }, [isMobile]);

    const schedulerTourSteps: Step[] = [
        {
            target: "[data-tour=\"scheduler-header\"]",
            content: t("dashboard.tours.scheduler.steps.header"),
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: "[data-tour=\"scheduler-status\"]",
            content: t("dashboard.tours.scheduler.steps.status"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"scheduler-tabs\"]",
            content: t("dashboard.tours.scheduler.steps.tabs"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"scheduler-filters\"]",
            content: t("dashboard.tours.scheduler.steps.filters"),
            placement: "bottom",
        },
        {
            target: "[data-tour=\"scheduler-bookings\"]",
            content: t("dashboard.tours.scheduler.steps.bookings"),
            placement: "top",
        },
        {
            target: "[data-tour=\"scheduler-availability\"]",
            content: t("dashboard.tours.scheduler.steps.availability"),
            placement: "top",
        },
        {
            target: "[data-tour=\"scheduler-blocked\"]",
            content: t("dashboard.tours.scheduler.steps.blocked"),
            placement: "top",
        },
    ];

    const handleSchedulerTourCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
            const delta = action === ACTIONS.PREV ? -1 : 1;
            setTourStepIndex(index + delta);
            return;
        }

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setTourRun(false);
            setTourStepIndex(0);
            if (typeof window !== "undefined") {
                window.localStorage.setItem("portyo:scheduler-tour-done", "true");
            }
        }
    };

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
            <div className="bg-surface-card rounded-2xl border border-border shadow-sm p-6 select-none">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
                    <span className="font-bold text-foreground text-lg">{format(currentMonth, "MMMM yyyy")}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
                </div>

                <div className="grid grid-cols-7 mb-4">
                    {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map(d => (
                        <div key={d} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">{t(`dashboard.scheduler.weekdaysShort.${d}`)}</div>
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
                                    aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all cursor-pointer relative
                                    ${!isCurrentMonth ? 'opacity-20' : ''}
                                    ${isPast ? 'opacity-30 cursor-not-allowed' : ''}
                                    ${isBlocked
                                        ? 'bg-destructive/10 text-destructive border-2 border-red-500' // Blocked State
                                        : 'bg-surface-card hover:bg-muted border border-transparent hover:border-border text-gray-700' // Available State
                                    }
                                `}
                            >
                                {format(day, 'd')}
                                {isBlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Ban className="w-6 h-6 opacity-20" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
                    <div className="w-3 h-3 rounded-full bg-destructive/10 border border-red-500"></div>
                    <span>{t("dashboard.scheduler.blockedDate")}</span>
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

    return (
        <AuthorizationGuard minPlan="standard">
            <div className="p-8 max-w-6xl mx-auto font-sans">
                <Joyride
                    steps={schedulerTourSteps}
                    run={tourRun && !isMobile}
                    stepIndex={tourStepIndex}
                    continuous
                    showSkipButton
                    spotlightClicks
                    scrollToFirstStep
                    callback={handleSchedulerTourCallback}
                    styles={joyrideStyles}
                    scrollOffset={joyrideProps.scrollOffset}
                    spotlightPadding={joyrideProps.spotlightPadding}
                    disableScrollParentFix={joyrideProps.disableScrollParentFix}
                />
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" data-tour="scheduler-header">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.scheduler.title")}</h1>
                        <p className="text-muted-foreground mt-2">{t("dashboard.scheduler.subtitle")}</p>
                    </div>
                    <div className="flex items-center gap-3" data-tour="scheduler-status">
                        {settings && (
                            <button
                                onClick={togglePause}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${settings.updatesPaused
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'}`}
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
                                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
                <div className="bg-surface-card rounded-3xl shadow-sm border border-border overflow-hidden min-h-[600px] flex flex-col">
                    <div className="border-b px-6 flex gap-8" data-tour="scheduler-tabs">
                        <button
                            onClick={() => { setActiveTab('today'); setCurrentPage(1); }}
                            className={`py-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'today' ? 'border-black text-black' : 'border-transparent text-muted-foreground hover:text-muted-foreground'}`}
                        >
                            <CalendarCheck className="w-4 h-4" />
                            {t("dashboard.scheduler.tabs.today")}
                        </button>
                        <button
                            onClick={() => { setActiveTab('bookings'); setCurrentPage(1); }}
                            className={`py-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'border-black text-black' : 'border-transparent text-muted-foreground hover:text-muted-foreground'}`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            {t("dashboard.scheduler.tabs.bookings")}
                        </button>
                        <button
                            onClick={() => setActiveTab('availability')}
                            className={`py-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'availability' ? 'border-black text-black' : 'border-transparent text-muted-foreground hover:text-muted-foreground'}`}
                        >
                            <Clock className="w-4 h-4" />
                            {t("dashboard.scheduler.tabs.availability")}
                        </button>
                    </div>

                    <div className="p-8 bg-muted/50 flex-1">
                        {activeTab === 'today' || activeTab === 'bookings' ? (
                            <div className="space-y-6 max-w-4xl mx-auto">

                                {/* Filter Tabs */}
                                {(activeTab === 'bookings' || activeTab === 'today') && (
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center" data-tour="scheduler-filters">
                                        <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit flex-wrap">
                                            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterStatus(status);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === status
                                                        ? 'bg-surface-card text-black shadow-sm'
                                                        : 'text-muted-foreground hover:text-gray-700'
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
                                                        className="pl-9 pr-3 py-2 bg-surface-card border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none shadow-sm"
                                                    />
                                                    <CalendarIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                                {filterDate && (
                                                    <button
                                                        onClick={() => setFilterDate("")}
                                                        className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-red-500 transition-colors"
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
                                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                            <div className="w-16 h-16 bg-surface-card rounded-2xl shadow-sm border border-border flex items-center justify-center mb-4">
                                                <CalendarIcon className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <h3 className="font-bold text-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>{activeTab === 'today' ? t("dashboard.scheduler.empty.todayTitle") : t("dashboard.scheduler.empty.title")}</h3>
                                            <p className="max-w-xs text-center text-sm">{activeTab === 'today' ? t("dashboard.scheduler.empty.todayBody") : t("dashboard.scheduler.empty.body")}</p>
                                        </div>
                                    ) : (
                                        bookings.map((booking: any) => {
                                            const statusColors: Record<string, string> = {
                                                pending: 'bg-amber-100 text-amber-700',
                                                confirmed: 'bg-green-100 text-green-700',
                                                cancelled: 'bg-red-100 text-destructive',
                                                completed: 'bg-blue-100 text-blue-700'
                                            };
                                            const isCancelled = booking.status === 'cancelled';

                                            return (
                                                <div key={booking.id} className={`bg-surface-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${isCancelled ? 'opacity-60' : ''}`}>
                                                    <div className="flex items-center gap-5">
                                                        <div className={`bg-muted text-foreground border border-border px-4 py-3 rounded-xl text-center min-w-[80px] ${isCancelled ? 'opacity-50' : ''}`}>
                                                            <div className="text-xl font-bold">{format(parseISO(booking.bookingDate), 'd')}</div>
                                                            <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">{format(parseISO(booking.bookingDate), 'MMM')}</div>
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                                                <h3 className={`font-bold text-base ${isCancelled ? 'text-muted-foreground line-through' : 'text-foreground'}`} style={{ fontFamily: 'var(--font-display)' }}>{booking.customerName}</h3>
                                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${statusColors[booking.status] || 'bg-muted text-muted-foreground'}`}>{t(`dashboard.scheduler.status.${booking.status}`)}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" /> {format(parseISO(booking.bookingDate), 'h:mm a')}</span>
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
                                                                className="px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
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
                                                                className="px-3 py-2 bg-destructive/10 text-destructive hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
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
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> {t("dashboard.scheduler.pagination.previous")}
                                        </button>
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {t("dashboard.scheduler.pagination.pageOf", { page: currentPage, totalPages })}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                    <section className="bg-surface-card p-8 rounded-3xl border border-border shadow-sm" data-tour="scheduler-availability">
                                        <h3 className="font-bold text-foreground mb-6 flex items-center gap-2 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                                            <Clock className="w-5 h-5 text-indigo-500" />
                                            {t("dashboard.scheduler.weeklySchedule.title")}
                                        </h3>
                                        <div className="space-y-4">
                                            {settings && days.map(day => {
                                                const schedule = settings.availability?.[day]?.[0];
                                                const isActive = !!schedule;
                                                const [start, end] = schedule ? schedule.split('-') : ["09:00", "17:00"];

                                                return (
                                                    <div key={day} className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${isActive ? 'bg-surface-card border-border shadow-sm' : 'bg-muted border-transparent opacity-60'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => updateAvailability(day, 'active')}
                                                                className={`w-12 h-7 rounded-full transition-colors relative ${isActive ? 'bg-black' : 'bg-gray-300'}`}
                                                            >
                                                                <div className={`absolute top-1 left-1 w-5 h-5 bg-surface-card rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                                            </button>
                                                            <span className="font-bold capitalize text-gray-700 w-16">{t(`dashboard.scheduler.days.${day}`)}</span>
                                                        </div>

                                                        {isActive ? (
                                                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                                                                <div className="relative">
                                                                    <input
                                                                        type="time"
                                                                        value={start}
                                                                        onChange={(e) => updateAvailability(day, 'start', e.target.value)}
                                                                        className="pl-3 pr-2 py-1.5 bg-muted border border-border rounded-lg text-sm font-semibold text-foreground focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                                                    />
                                                                </div>
                                                                <span className="text-muted-foreground">-</span>
                                                                <div className="relative">
                                                                    <input
                                                                        type="time"
                                                                        value={end}
                                                                        onChange={(e) => updateAvailability(day, 'end', e.target.value)}
                                                                        className="pl-3 pr-2 py-1.5 bg-muted border border-border rounded-lg text-sm font-semibold text-foreground focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-medium text-muted-foreground italic px-4">{t("dashboard.scheduler.weeklySchedule.unavailable")}</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: General Settings & Blocked Dates */}
                                <div className="space-y-8">
                                    {/* Google Calendar Integration - Moved to top for visibility */}
                                    <section className={`p-6 rounded-3xl border transition-all ${bio?.integrations?.some((i: any) => i.name === 'google-calendar')
                                        ? 'bg-green-500/10 border-green-200'
                                        : 'bg-surface-card border-blue-100 shadow-sm'}`}>

                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className={`font-bold text-lg flex items-center gap-2 ${bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? 'text-green-900' : 'text-foreground'}`} style={{ fontFamily: 'var(--font-display)' }}>
                                                <CalendarIcon className={`w-5 h-5 ${bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? 'text-green-400' : 'text-blue-500'}`} />
                                                Google Calendar
                                            </h3>
                                            {bio?.integrations?.some((i: any) => i.name === 'google-calendar') && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                                    <Check className="w-3 h-3" />
                                                    {t("dashboard.scheduler.googleCalendar.active")}
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-sm mb-6 ${bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? 'text-green-800' : 'text-muted-foreground'}`}>
                                            {bio?.integrations?.some((i: any) => i.name === 'google-calendar')
                                                ? t("dashboard.scheduler.googleCalendar.connected")
                                                : t("dashboard.scheduler.googleCalendar.disconnected")}
                                        </p>

                                        <button
                                            onClick={() => {
                                                window.open(`${api.defaults.baseURL}/google-calendar/auth/${bio?.id}`, '_blank', 'width=500,height=600');
                                            }}
                                            className={`w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${bio?.integrations?.some((i: any) => i.name === 'google-calendar')
                                                ? 'bg-surface-card text-green-700 border border-green-200 hover:bg-green-500/10'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                                }`}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            {bio?.integrations?.some((i: any) => i.name === 'google-calendar') ? t("dashboard.scheduler.googleCalendar.reconnect") : t("dashboard.scheduler.googleCalendar.connect")}
                                        </button>
                                    </section>

                                    <section className="bg-surface-card p-8 rounded-3xl border border-border shadow-sm" data-tour="scheduler-blocked">
                                        <h3 className="font-bold text-foreground mb-6 flex items-center gap-2 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                                            <ShieldAlert className="w-5 h-5 text-red-500" />
                                            {t("dashboard.scheduler.blockedDates.title")}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">{t("dashboard.scheduler.blockedDates.subtitle")}</p>
                                        {renderCalendar()}
                                    </section>

                                    <section className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                                        <h3 className="font-bold text-amber-900 mb-3 text-lg" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.scheduler.meetingDuration.title")}</h3>
                                        <div className="relative">
                                            <select
                                                value={settings?.durationMinutes || 30}
                                                onChange={(e) => setSettings({ ...settings, durationMinutes: parseInt(e.target.value) })}
                                                className="w-full bg-surface-card border border-amber-200 text-amber-900 font-bold rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none"
                                            >
                                                <option value="15">{t("dashboard.scheduler.meetingDuration.minutes", { count: 15 })}</option>
                                                <option value="30">{t("dashboard.scheduler.meetingDuration.minutes", { count: 30 })}</option>
                                                <option value="45">{t("dashboard.scheduler.meetingDuration.minutes", { count: 45 })}</option>
                                                <option value="60">{t("dashboard.scheduler.meetingDuration.minutes", { count: 60 })}</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-700">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
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
                    <div className="bg-surface-card rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.scheduler.reschedule.title")}</h3>
                            <button onClick={() => setRescheduleModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="bg-muted rounded-xl p-3 mb-4">
                            <p className="text-sm text-muted-foreground">
                                {t("dashboard.scheduler.reschedule.for", { name: rescheduleBooking.customerName })}
                            </p>
                            <p className="text-xs text-muted-foreground">{rescheduleBooking.customerEmail}</p>
                        </div>

                        <p className="text-muted-foreground text-sm mb-4">{t("dashboard.scheduler.reschedule.helper")}</p>

                        {/* Calendar */}
                        <div className="mb-4 border border-border rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => setRescheduleMonth(subMonths(rescheduleMonth, 1))} className="p-2 hover:bg-muted rounded-full">
                                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                                </button>
                                <span className="font-bold text-foreground">{format(rescheduleMonth, "MMMM yyyy")}</span>
                                <button onClick={() => setRescheduleMonth(addMonths(rescheduleMonth, 1))} className="p-2 hover:bg-muted rounded-full">
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 mb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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
                                                    p-1 w-9 h-9 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all
                                                    ${!isCurrentMonth ? "opacity-30" : ""}
                                                    ${isDisabled ? "text-gray-300 pointer-events-none" : "hover:bg-muted text-gray-700"}
                                                    ${isSelected ? "bg-black text-white hover:bg-gray-800 font-semibold" : ""}
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
                            <div className="mb-4">
                                <p className="text-sm font-bold text-gray-700 mb-3">
                                    {t("dashboard.scheduler.reschedule.availableTimes", { date: format(rescheduleDate, 'MMMM d') })}
                                </p>
                                {rescheduleSlotsLoading ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : rescheduleSlots.length === 0 ? (
                                    <p className="text-muted-foreground text-sm text-center py-6 bg-muted rounded-xl">{t("dashboard.scheduler.reschedule.noSlots")}</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {rescheduleSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setRescheduleTime(slot)}
                                                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${rescheduleTime === slot
                                                    ? 'bg-black text-white shadow-lg'
                                                    : 'bg-muted hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setRescheduleModalOpen(false)}
                                className="flex-1 py-3 bg-muted hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                {t("dashboard.scheduler.reschedule.cancel")}
                            </button>
                            <button
                                onClick={async () => {
                                    if (!rescheduleDate || !rescheduleTime || !rescheduleBooking?.confirmationToken) return;
                                    setRescheduleLoading(true);
                                    try {
                                        await api.post(`/public/bookings/reschedule/${rescheduleBooking.confirmationToken}`, {
                                            date: format(rescheduleDate, 'yyyy-MM-dd'),
                                            time: rescheduleTime
                                        });
                                        setRescheduleModalOpen(false);
                                        fetchData();
                                    } catch (err: any) {
                                        alert(err.response?.data?.message || t("dashboard.scheduler.errors.reschedule"));
                                    } finally {
                                        setRescheduleLoading(false);
                                    }
                                }}
                                disabled={rescheduleLoading || !rescheduleDate || !rescheduleTime}
                                className="flex-1 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {rescheduleLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> {t("dashboard.scheduler.reschedule.loading")}</>
                                ) : (
                                    t("dashboard.scheduler.reschedule.confirm")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthorizationGuard>
    );
}

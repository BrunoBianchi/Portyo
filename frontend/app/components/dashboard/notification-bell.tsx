import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { notificationService, type Notification } from "~/services/notification.service";
import { NotificationItem } from "~/components/dashboard/notification-item";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

export function NotificationBell() {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 384 }); // Default w-96

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const currentLang = location.pathname.match(/^\/(en|pt)(?:\/|$)/)?.[1] || i18n.resolvedLanguage || i18n.language || "en";
    const withLang = (to: string) => {
        if (to.startsWith("http")) return to;
        if (/^\/(en|pt)(\/|$)/.test(to)) return to;
        return to === "/" ? `/${currentLang}` : `/${currentLang}${to}`;
    };

    // Calculate position
    const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            setDropdownPos({
                top: 0, // Not used for mobile bottom sheet style
                left: 0,
                width: window.innerWidth
            });
        } else {
            // Desktop: Align left edge of dropdown with left edge of button (since it's in left sidebar)
            // But verify if it fits
            let left = rect.left;
            const width = 384; // w-96

            // If it would overflow right, shift it? (Unlikely for left sidebar)
            // Just in case:
            if (left + width > window.innerWidth) {
                left = window.innerWidth - width - 16;
            }

            setDropdownPos({
                top: rect.bottom + 8,
                left: left,
                width: width
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }
    }, [isOpen]);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(1, 5, false);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count only
    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (isOpen) {
                fetchNotifications();
            } else {
                fetchUnreadCount();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t("dashboard.notifications.bell")}
            >
                <Bell className={`w-5 h-5 text-gray-600 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5 flex flex-col"
                    style={{
                        ...(window.innerWidth < 768 ? {
                            top: 'auto',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            width: '100%',
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            maxHeight: '80vh'
                        } : {
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            width: dropdownPos.width,
                            maxHeight: '600px'
                        })
                    }}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
                        <h3 className="font-bold text-gray-900">{t("dashboard.notifications.title")}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                            >
                                {t("dashboard.notifications.markAllRead")}
                            </button>
                        )}
                        {/* Mobile close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden p-1 hover:bg-gray-200 rounded-full"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Notifications List - flexible height */}
                    <div className="overflow-y-auto flex-1 overscroll-contain">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">{t("dashboard.notifications.empty")}</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onDelete={handleDelete}
                                    onClose={() => setIsOpen(false)}
                                    withLang={withLang}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer - fixed at bottom */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                            <Link
                                to={withLang("/dashboard/notifications")}
                                className="block text-center text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {t("dashboard.notifications.viewAll")}
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Overlay */}
            {isOpen && window.innerWidth < 768 && (
                <div
                    className="fixed inset-0 bg-black/20 z-[9998] md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

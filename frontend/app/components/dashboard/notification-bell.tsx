import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, X, Check } from "lucide-react";
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
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 384 });

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
                top: 0,
                left: 0,
                width: window.innerWidth
            });
        } else {
            // Desktop: Align left edge or right edge depending on space
            const width = 400;
            let left = rect.left;

            // Try to align left, but checking overflow right
            if (left + width > window.innerWidth) {
                // Align right edge with button right edge if possible, or just stick to window right
                left = window.innerWidth - width - 24;
            }

            // Vertical position: below button
            const top = rect.bottom + 12;

            setDropdownPos({
                top,
                left,
                width
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
                className="relative p-2.5 rounded-full hover:bg-black/5 text-gray-500 transition-colors group"
                aria-label={t("dashboard.notifications.bell")}
            >
                <Bell className={`w-5 h-5 stroke-[2px] ${isOpen ? 'text-black' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F3F3F1]"></span>
                )}
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999]">
                    {/* Helper to calculate position relative to button in mobile? No, mobile uses fixed bottom */}

                    {/* Mobile Overlay */}
                    {window.innerWidth < 768 && (
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                    )}

                    <div
                        ref={dropdownRef}
                        className="absolute bg-white flex flex-col overflow-hidden"
                        style={{
                            ...(window.innerWidth < 768 ? {
                                bottom: 0,
                                left: 0,
                                right: 0,
                                width: '100%',
                                maxHeight: '85vh',
                                borderTopLeftRadius: '24px',
                                borderTopRightRadius: '24px',
                                borderBottom: 'none',
                                borderLeft: 'none',
                                borderRight: 'none',
                                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
                            } : {
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                                width: dropdownPos.width,
                                maxHeight: '600px',
                                borderRadius: '16px',
                                border: '2px solid black',
                                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'
                            })
                        }}
                    >
                        {/* Header */}
                        <div className="p-4 border-b-2 border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
                            <h3 className="font-black text-lg text-[#1A1A1A]">{t("dashboard.notifications.title")}</h3>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
                                    >
                                        <Check className="w-3 h-3" />
                                        {t("dashboard.notifications.markAllRead")}
                                    </button>
                                )}
                                {/* Mobile close button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="md:hidden p-1 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1 overscroll-contain bg-white">
                            {loading && notifications.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-xs font-bold uppercase tracking-wider">Loading...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-bold text-gray-900">{t("dashboard.notifications.empty")}</p>
                                    <p className="text-xs mt-1">{t("dashboard.notifications.emptyDesc", "You're all caught up!")}</p>
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

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t-2 border-gray-100 bg-gray-50 flex-shrink-0">
                                <Link
                                    to={withLang("/dashboard/notifications")}
                                    className="block text-center text-sm font-black text-[#1A1A1A] hover:underline uppercase tracking-wide"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t("dashboard.notifications.viewAll")}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

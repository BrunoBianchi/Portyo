import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import * as Icons from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Notification } from "~/services/notification.service";
import { Link } from "react-router";

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    withLang: (to: string) => string;
}

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onClose,
    withLang
}: NotificationItemProps) {
    const { i18n } = useTranslation();

    // Get icon component
    const IconComponent = (Icons as any)[notification.icon] || Icons.Bell;

    // Format relative time
    const locale = i18n.language === "pt" ? ptBR : enUS;
    const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale,
    });

    // Get type color
    const typeColors = {
        achievement: "text-yellow-600 bg-yellow-100",
        lead: "text-blue-600 bg-blue-100",
        booking: "text-green-600 bg-green-100",
        sale: "text-emerald-700 bg-emerald-100",
        announcement: "text-purple-600 bg-purple-100",
        update: "text-gray-600 bg-gray-100",
    };

    const colorClass = typeColors[notification.type] || typeColors.update;

    const content = (
        <div
            className={`p-4 transition-colors cursor-pointer border-b border-gray-100 last:border-0 ${notification.isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-[#FAFAFA] hover:bg-white"
                } relative group`}
            onClick={() => {
                if (!notification.isRead) {
                    onMarkAsRead(notification.id);
                }
                if (notification.link) {
                    onClose();
                }
            }}
        >
            {/* Indicator for unread */}
            {!notification.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C6F035]" />
            )}

            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-xl ${colorClass} shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-bold ${notification.isRead ? 'text-gray-600' : 'text-[#1A1A1A]'}`}>
                            {notification.title}
                        </h4>
                    </div>
                    <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{relativeTime}</span>

                        <div className="flex items-center gap-2">
                            {!notification.isRead && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead(notification.id);
                                    }}
                                    className="text-xs text-black hover:text-[#C6F035] bg-gray-100 hover:bg-black font-bold px-2 py-1 rounded transition-colors"
                                >
                                    {i18n.language === "pt" ? "Marcar lida" : "Mark read"}
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification.id);
                                }}
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                title={i18n.language === "pt" ? "Excluir notificação" : "Delete notification"}
                            >
                                <Icons.Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // If has link, wrap in Link component
    if (notification.link) {
        return (
            <Link to={withLang(notification.link)} className="block">
                {content}
            </Link>
        );
    }

    return content;
}

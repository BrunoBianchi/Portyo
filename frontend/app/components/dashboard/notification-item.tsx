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
        achievement: "text-yellow-600 bg-yellow-50",
        lead: "text-blue-600 bg-blue-50",
        booking: "text-green-600 bg-green-50",
        sale: "text-emerald-600 bg-emerald-50",
        announcement: "text-purple-600 bg-purple-50",
        update: "text-gray-600 bg-gray-50",
    };

    const colorClass = typeColors[notification.type] || typeColors.update;

    const content = (
        <div
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${notification.isRead ? "border-transparent" : "border-primary bg-blue-50/30"
                }`}
            onClick={() => {
                if (!notification.isRead) {
                    onMarkAsRead(notification.id);
                }
                if (notification.link) {
                    onClose();
                }
            }}
        >
            <div className="flex items-start gap-3 group relative">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${colorClass} shrink-0`}>
                    <IconComponent className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-bold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                        </h4>
                        {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1"></div>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{relativeTime}</span>
                        <div className="flex items-center gap-2">
                            {!notification.isRead && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead(notification.id);
                                    }}
                                    className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                                >
                                    {i18n.language === "pt" ? "Marcar como lida" : "Mark as read"}
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification.id);
                                }}
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
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

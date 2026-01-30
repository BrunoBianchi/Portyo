import { api } from "./api";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "achievement" | "lead" | "booking" | "sale" | "announcement" | "update";
    icon: string;
    isRead: boolean;
    link: string | null;
    metadata: any;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
}

export const notificationService = {
    async getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false): Promise<NotificationsResponse> {
        const response = await api.get(`/notifications`, {
            params: { page, limit, unreadOnly },
        });
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get(`/notifications/unread-count`);
        return response.data.count;
    },

    async markAsRead(notificationId: string): Promise<Notification> {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },

    async markAllAsRead(): Promise<void> {
        await api.patch(`/notifications/mark-all-read`);
    },

    async deleteNotification(notificationId: string): Promise<void> {
        await api.delete(`/notifications/${notificationId}`);
    },
};

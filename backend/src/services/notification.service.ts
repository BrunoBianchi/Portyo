import { AppDataSource } from "../database/datasource";
import { NotificationEntity, NotificationType } from "../database/entity/notification-entity";
import { UserEntity } from "../database/entity/user-entity";
import { BioEntity } from "../database/entity/bio-entity";
import { FindOptionsWhere, LessThan } from "typeorm";

export class NotificationService {
    private notificationRepository = AppDataSource.getRepository(NotificationEntity);

    /**
     * Create a new notification
     */
    async createNotification(data: {
        userId: string;
        title: string;
        message: string;
        type: NotificationType;
        icon?: string;
        link?: string;
        metadata?: any;
        bioId?: string;
    }): Promise<NotificationEntity> {
        const notification = this.notificationRepository.create({
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            icon: data.icon || "Bell",
            link: data.link,
            metadata: data.metadata,
            bioId: data.bioId,
        });

        return await this.notificationRepository.save(notification);
    }

    /**
     * Get notifications for a user
     */
    async getNotifications(
        userId: string,
        options: {
            page?: number;
            limit?: number;
            unreadOnly?: boolean;
        } = {}
    ): Promise<{ notifications: NotificationEntity[]; total: number; unreadCount: number }> {
        const { page = 1, limit = 20, unreadOnly = false } = options;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<NotificationEntity> = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }

        const [notifications, total] = await this.notificationRepository.findAndCount({
            where,
            order: { createdAt: "DESC" },
            skip,
            take: limit,
            relations: ["bio"],
        });

        const unreadCount = await this.notificationRepository.count({
            where: { userId, isRead: false },
        });

        return { notifications, total, unreadCount };
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await this.notificationRepository.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<NotificationEntity | null> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            return null;
        }

        notification.isRead = true;
        return await this.notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
        const result = await this.notificationRepository.delete({
            id: notificationId,
            userId,
        });

        return (result.affected || 0) > 0;
    }

    /**
     * Delete old notifications (older than 30 days)
     */
    async deleteOldNotifications(): Promise<number> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await this.notificationRepository.delete({
            createdAt: LessThan(thirtyDaysAgo),
        });

        return result.affected || 0;
    }

    /**
     * Create an achievement notification (for milestones)
     */
    async createAchievementNotification(
        userId: string,
        bioId: string,
        milestone: number,
        bioSufix: string
    ): Promise<NotificationEntity> {
        let milestoneText = milestone.toString();
        if (milestone >= 1000000) {
            milestoneText = `${(milestone / 1000000).toFixed(1)}M`;
        } else if (milestone >= 1000) {
            milestoneText = `${(milestone / 1000).toFixed(milestone % 1000 === 0 ? 0 : 1)}K`;
        }

        return await this.createNotification({
            userId,
            bioId,
            title: `🎉 ${milestoneText} visualizações!`,
            message: `Sua página ${bioSufix} atingiu ${milestoneText} visualizações totais!`,
            type: NotificationType.ACHIEVEMENT,
            icon: "TrendingUp",
            link: `/dashboard/analytics`,
            metadata: {
                milestone,
                bioSufix,
            },
        });
    }

    /**
     * Create a system-wide notification (admin only)
     */
    async createSystemNotification(
        title: string,
        message: string,
        icon?: string,
        link?: string
    ): Promise<void> {
        const userRepository = AppDataSource.getRepository(UserEntity);
        const users = await userRepository.find({ select: ["id"] });

        const notifications = users.map(user =>
            this.notificationRepository.create({
                userId: user.id,
                title,
                message,
                type: NotificationType.ANNOUNCEMENT,
                icon: icon || "Megaphone",
                link,
            })
        );

        await this.notificationRepository.save(notifications);
    }

    /**
     * Create notification for new lead
     */
    async createLeadNotification(
        userId: string,
        bioId: string,
        formName: string,
        leadName: string
    ): Promise<NotificationEntity> {
        return await this.createNotification({
            userId,
            bioId,
            title: "Novo Lead! 📬",
            message: `${leadName} preencheu o formulário "${formName}"`,
            type: NotificationType.LEAD,
            icon: "UserPlus",
            link: "/dashboard/leads",
            metadata: {
                formName,
                leadName,
            },
        });
    }

    /**
     * Create notification for new booking
     */
    async createBookingNotification(
        userId: string,
        bioId: string,
        customerName: string,
        bookingDate: Date
    ): Promise<NotificationEntity> {
        return await this.createNotification({
            userId,
            bioId,
            title: "Novo Agendamento! 📅",
            message: `${customerName} agendou um horário para ${new Date(bookingDate).toLocaleDateString('pt-BR')}`,
            type: NotificationType.BOOKING,
            icon: "CalendarCheck",
            link: "/dashboard/scheduler",
            metadata: {
                customerName,
                bookingDate,
            },
        });
    }

    /**
     * Create welcome notification for new user
     */
    async createWelcomeNotification(userId: string): Promise<NotificationEntity> {
        return await this.createNotification({
            userId,
            title: "Welcome to Portyo! 🎉",
            message: "We're excited to have you here. This is your notification center where you'll see updates about your page's performance, new leads, and achievements.",
            type: NotificationType.ANNOUNCEMENT,
            icon: "Sparkles",
            link: "/dashboard/overview"
        });
    }

    /**
     * Create plan expiration notification
     */
    async createPlanExpirationNotification(
        userId: string,
        daysRemaining: number,
        isTrial: boolean
    ): Promise<NotificationEntity> {
        const title = isTrial
            ? `⚠️ Seu teste grátis acaba em ${daysRemaining} dias!`
            : `📅 Sua assinatura vence em ${daysRemaining} dias`;

        const message = isTrial
            ? "Seu teste grátis termina em breve e a cobrança será automática após o período. Você pode cancelar a qualquer momento antes da cobrança."
            : "Renove sua assinatura para manter seu acesso sem interrupções.";

        return await this.createNotification({
            userId,
            title,
            message,
            type: NotificationType.UPDATE,
            icon: "Clock",
            link: "/dashboard/settings/billing",
            metadata: {
                daysRemaining,
                isTrial
            }
        });
    }
}

export const notificationService = new NotificationService();

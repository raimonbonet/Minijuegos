import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async getUserNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== userId) {
            throw new InternalServerErrorException('Notificación no encontrada');
        }

        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async createNotification(userId: string, title: string, message: string, type: string = 'INFO') {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
            },
        });
    }

    async broadcast(title: string, message: string, type: string = 'INFO') {
        const users = await this.prisma.user.findMany({ select: { id: true } });

        const notificationsUrl = users.map(user => ({
            userId: user.id,
            title,
            message,
            type
        }));

        await this.prisma.notification.createMany({
            data: notificationsUrl,
        });

        return { message: `Broadcast sent to ${users.length} users` };
    }

    async sendToAdmins(senderId: string, subject: string, message: string) {
        const admins = await this.prisma.user.findMany({ where: { isAdmin: true }, select: { id: true } });
        const sender = await this.prisma.user.findUnique({ where: { id: senderId }, select: { username: true, email: true } });

        const notificationsData = admins.map(admin => ({
            userId: admin.id,
            title: `Soporte: ${subject}`,
            message: `De: ${sender?.username || 'Usuario'} (${sender?.email || 'N/A'})\n\nMensaje:\n${message}`,
            type: 'SUPPORT'
        }));

        if (notificationsData.length > 0) {
            await this.prisma.notification.createMany({
                data: notificationsData,
            });
        }

        return { message: 'Mensaje enviado a soporte correctamente' };
    }
}

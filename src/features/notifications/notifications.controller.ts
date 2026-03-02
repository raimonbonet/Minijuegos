import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { AdminGuard } from '../../shared/guards/admin.guard';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserNotifications(@Request() req) {
        return this.notificationsService.getUserNotifications(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        return this.notificationsService.getUnreadCount(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        return this.notificationsService.markAsRead(id, req.user.userId);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @Post('broadcast')
    async broadcast(@Body() body: { title: string, message: string, type?: string }) {
        return this.notificationsService.broadcast(body.title, body.message, body.type);
    }

    @UseGuards(JwtAuthGuard)
    @Post('support')
    async contactSupport(@Request() req, @Body() body: { subject: string, message: string }) {
        return this.notificationsService.sendToAdmins(req.user.userId, body.subject, body.message);
    }
}

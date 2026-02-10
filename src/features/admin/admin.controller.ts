
import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { AdminGuard } from '../../shared/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('users')
    async getUsers(@Query('search') search: string) {
        return this.adminService.findAll(search);
    }

    @Patch('users/:id/zoins')
    async updateZoins(
        @Param('id') id: string,
        @Body() body: { amount: number; mode: 'set' | 'add' },
    ) {
        return this.adminService.updateZoins(id, body.amount, body.mode);
    }

    @Patch('users/:id/unfreeze')
    async unfreezeUser(@Param('id') id: string) {
        return this.adminService.unfreezeUser(id);
    }

    @Get('rankings-list')
    async getScores(@Query('game') game?: string) {
        return this.adminService.getAllScores(game);
    }
}

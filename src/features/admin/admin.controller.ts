
import { Controller, Get, Patch, Param, Body, Query, UseGuards, Post, Delete } from '@nestjs/common';
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
    async getScores(
        @Query() query: { page?: string; limit?: string; game?: string; search?: string, sortBy?: string, sortDir?: 'asc' | 'desc' },
    ) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const sortBy = query.sortBy || 'amount';
        const sortDir = query.sortDir || 'desc';
        return this.adminService.getRankingsList(page, limit, query.game, query.search, sortBy, sortDir);
    }

    @Get('beta-testers')
    async getBetaTesters() {
        return this.adminService.getBetaTesters();
    }

    @Post('beta-testers')
    async addBetaTester(@Body() body: { email: string }) {
        return this.adminService.addBetaTester(body.email);
    }

    @Delete('beta-testers/:id')
    async removeBetaTester(@Param('id') id: string) {
        return this.adminService.removeBetaTester(id);
    }
}

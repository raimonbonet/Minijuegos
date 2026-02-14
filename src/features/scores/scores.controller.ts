
import { Controller, Get, Post, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@Controller('scores')
export class ScoresController {
    constructor(private scoresService: ScoresService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Request() req, @Body() body: { amount: number; game?: string; zoins?: number }) {
        try {
            return await this.scoresService.create(req.user.userId, body.amount, body.game, body.zoins);
        } catch (error: any) {
            console.error('Error creating score:', error);
            throw new HttpException(error.message || 'Error creating score', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMyScores(@Request() req) {
        return this.scoresService.getUserScores(req.user.userId);
    }

    @Get('top/:game')
    async getTop(@Param('game') game: string) {
        return this.scoresService.getTop(game);
    }
}

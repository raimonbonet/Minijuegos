import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { TransactionType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
    constructor(private walletService: WalletService) { }

    @Get('balance')
    async getBalance(@Request() req) {
        return this.walletService.getWalletByUserId(req.user.userId);
    }

    @Post('deposit')
    async deposit(@Request() req, @Body('amount') amount: number) {
        return this.walletService.updateBalance(
            req.user.userId,
            amount,
            TransactionType.DEPOSIT,
            'User manual deposit',
        );
    }
}

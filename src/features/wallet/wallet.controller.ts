import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { TransactionType } from '@prisma/client';

import { TransactionService } from './transaction.service';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
    constructor(
        private walletService: WalletService,
        private transactionService: TransactionService
    ) { }

    @Get('balance')
    async getBalance(@Request() req) {
        return this.walletService.getWalletByUserId(req.user.userId);
    }

    @Get('transactions')
    async getTransactions(@Request() req) {
        return this.transactionService.getUserTransactions(req.user.userId);
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

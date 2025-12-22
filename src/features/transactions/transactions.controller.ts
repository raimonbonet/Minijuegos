import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) { }

    @Get()
    async getMyTransactions(@Request() req) {
        return this.transactionsService.getTransactionsByUserId(req.user.userId);
    }
}

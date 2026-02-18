
import { Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { UsersModule } from '../users/users.module';
import { RankingScheduler } from './ranking.scheduler';
import { TransactionService } from '../wallet/transaction.service';

@Module({
    imports: [PrismaModule, WalletModule, UsersModule],
    controllers: [ScoresController],
    providers: [ScoresService, RankingScheduler, TransactionService],
})
export class ScoresModule { }

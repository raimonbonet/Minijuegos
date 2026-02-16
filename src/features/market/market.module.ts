import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
    imports: [UsersModule, WalletModule, PrismaModule],
    controllers: [MarketController],
    providers: [MarketService],
})
export class MarketModule { }

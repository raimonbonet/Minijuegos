
import { Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [PrismaModule, WalletModule],
    controllers: [ScoresController],
    providers: [ScoresService],
})
export class ScoresModule { }

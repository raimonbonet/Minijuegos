
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [PrismaModule, WalletModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }

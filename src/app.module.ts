import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './features/users/users.module';
import { WalletModule } from './features/wallet/wallet.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { AuthModule } from './features/auth/auth.module';
import { PaymentsModule } from './features/payments/payments.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AdminModule } from './features/admin/admin.module';
import { ScoresModule } from './features/scores/scores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    UsersModule,
    WalletModule,
    TransactionsModule,
    AuthModule,
    PaymentsModule,
    AdminModule,
    ScoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
import { WalletController } from './wallet.controller';

@Module({
  providers: [WalletService, TransactionService],
  controllers: [WalletController],
  exports: [WalletService, TransactionService],
})
export class WalletModule { }

import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
export declare class WalletController {
    private walletService;
    private transactionService;
    constructor(walletService: WalletService, transactionService: TransactionService);
    getBalance(req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
    } | null>;
    getTransactions(req: any): Promise<{
        id: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        signature: string;
        walletId: string;
    }[]>;
    deposit(req: any, amount: number): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
    }>;
}

import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
export declare class WalletController {
    private walletService;
    private transactionService;
    constructor(walletService: WalletService, transactionService: TransactionService);
    getBalance(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
    } | null>;
    getTransactions(req: any): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
        signature: string;
        walletId: string;
    }[]>;
    deposit(req: any, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
    }>;
}

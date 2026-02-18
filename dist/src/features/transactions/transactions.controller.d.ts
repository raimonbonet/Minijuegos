import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    getMyTransactions(req: any): Promise<{
        id: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        signature: string;
        walletId: string;
    }[]>;
}

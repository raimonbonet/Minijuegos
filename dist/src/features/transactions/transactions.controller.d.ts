import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    getMyTransactions(req: any): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string | null;
        walletId: string;
    }[]>;
}

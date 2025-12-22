import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    getMyTransactions(req: any): Promise<{
        id: string;
        createdAt: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        walletId: string;
    }[]>;
}

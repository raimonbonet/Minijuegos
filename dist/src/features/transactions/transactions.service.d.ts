import { PrismaService } from '../../shared/prisma/prisma.service';
import { Transaction } from '@prisma/client';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getTransactionsByUserId(userId: string): Promise<Transaction[]>;
}

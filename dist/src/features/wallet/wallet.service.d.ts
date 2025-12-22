import { PrismaService } from '../../shared/prisma/prisma.service';
import { TransactionType, Wallet } from '@prisma/client';
export declare class WalletService {
    private prisma;
    constructor(prisma: PrismaService);
    createWallet(userId: string): Promise<Wallet>;
    getWalletByUserId(userId: string): Promise<Wallet | null>;
    updateBalance(userId: string, amount: number, type: TransactionType, description: string): Promise<Wallet>;
}

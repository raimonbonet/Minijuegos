import { WalletService } from './wallet.service';
export declare class WalletController {
    private walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        userId: string;
    } | null>;
    deposit(req: any, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        userId: string;
    }>;
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionService {
    private readonly secret: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) {
        this.secret = this.configService.get<string>('TRANSACTION_SECRET') || 'default-secret-key-change-me';
    }

    private generateSignature(userId: string, amount: number, type: string, timestamp: number): string {
        const data = `${userId}:${amount}:${type}:${timestamp}`;
        return createHmac('sha256', this.secret).update(data).digest('hex');
    }

    async createTransaction(userId: string, amount: number, type: 'GAME_REWARD' | 'ADMIN_ADJUSTMENT' | 'DEPOSIT' | 'WITHDRAWAL', description?: string) {
        const timestamp = Date.now();
        const signature = this.generateSignature(userId, amount, type, timestamp);

        // Perform transaction atomically
        return this.prisma.$transaction(async (prisma) => {
            // 0. Ensure Wallet Exists
            let wallet = await prisma.wallet.findUnique({ where: { userId } });
            if (!wallet) {
                wallet = await prisma.wallet.create({ data: { userId } });
            }

            // 1. Create Transaction Record (Linked to Wallet, secured by signature)
            // Note: Prisma schema uses 'walletId', not 'userId' for Transaction relation now.
            const transaction = await prisma.transaction.create({
                data: {
                    amount,
                    type: type as any, // Cast to any if enum mismatch in types
                    description,
                    walletId: wallet.id,
                    signature: `${timestamp}:${signature}`,
                }
            });

            // 2. Update User Balance (The main display) AND Wallet Balance (Mirror)
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    Zoins: { increment: amount }
                }
            });

            await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
            });

            return { transaction, newBalance: user.Zoins };
        });
    }

    async freezeAccount(userId: string, reason: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isFrozen: true }
        });
    }
}

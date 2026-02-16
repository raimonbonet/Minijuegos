import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TransactionType, Wallet } from '@prisma/client';
import { Prisma } from '@prisma/client'; // Keep Prisma import for Decimal

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) { }

    async createWallet(userId: string): Promise<Wallet> {
        return this.prisma.wallet.create({
            data: {
                userId,
                balance: 0,
            },
        });
    }

    async getWalletByUserId(userId: string): Promise<Wallet | null> {
        return this.prisma.wallet.findUnique({
            where: { userId },
        });
    }

    async updateBalance(
        userId: string,
        amount: number,
        type: TransactionType,
        description: string,
    ): Promise<Wallet> {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });

            if (!wallet) {
                throw new BadRequestException('Wallet not found');
            }

            const newBalance = new Prisma.Decimal(wallet.balance as any).add(amount);

            if (newBalance.lt(0)) {
                throw new BadRequestException('Insufficient funds');
            }

            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: newBalance },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type,
                    description,
                },
            });

            return updatedWallet;
        });
    }
}

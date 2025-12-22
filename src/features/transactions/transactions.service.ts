import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            where: {
                wallet: {
                    userId,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}

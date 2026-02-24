
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private walletService: WalletService
    ) { }

    async findAll(search?: string) {
        const where: Prisma.UserWhereInput = search
            ? {
                OR: [
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { apellidos: { contains: search, mode: 'insensitive' } },
                    { dni: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                dni: true,
                isAdmin: true,
                isFrozen: true, // Allow admin to see frozen status
                wallet: {
                    select: {
                        balance: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Map wallet balance to the expected 'Zoins' property for the frontend
        return users.map(user => ({
            ...user,
            Zoins: user.wallet ? Number(user.wallet.balance) : 0,
            wallet: undefined // Remove wallet object from response to keep it clean
        }));
    }

    async unfreezeUser(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { isFrozen: false },
        });
    }

    async getRankingsList(page: number = 1, limit: number = 20, game?: string, search?: string, sortBy: string = 'amount', sortDir: 'asc' | 'desc' = 'desc') {
        console.log('getRankingsList called with:', { page, limit, game, search, sortBy, sortDir });
        const skip = (page - 1) * limit;

        const where: any = {};
        if (game) {
            where.game = game;
        }
        if (search) {
            where.user = {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { apellidos: { contains: search, mode: 'insensitive' } },
                ],
            };
        }

        const orderByOptions: any = {};
        if (sortBy === 'createdAt') {
            orderByOptions.createdAt = sortDir;
        } else if (sortBy === 'game') {
            orderByOptions.game = sortDir;
        } else if (sortBy === 'player') {
            orderByOptions.user = { email: sortDir }; // Sort by the related user's email
        } else {
            orderByOptions.amount = sortDir;
        }

        const [scores, total] = await Promise.all([
            this.prisma.score.findMany({
                where,
                include: {
                    user: {
                        select: {
                            email: true,
                            username: true,
                            nombre: true,
                            apellidos: true,
                        }
                    }
                },
                orderBy: orderByOptions,
                skip,
                take: limit
            }),
            this.prisma.score.count({ where }),
        ]);

        return {
            data: scores,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateZoins(id: string, amount: number, mode: 'set' | 'add') {
        if (mode === 'add') {
            return this.walletService.updateBalance(
                id,
                amount,
                TransactionType.ADMIN_ADJUSTMENT,
                'Ajuste manual de administrador'
            );
        } else {
            // 'set' mode: Calculate difference
            const wallet = await this.walletService.getWalletByUserId(id);
            if (!wallet) throw new Error('Wallet not found for user');

            const currentBalance = Number(wallet.balance);
            const difference = amount - currentBalance;

            if (difference === 0) return wallet; // No change

            return this.walletService.updateBalance(
                id,
                difference,
                TransactionType.ADMIN_ADJUSTMENT,
                'Ajuste manual de administrador (Set)'
            );
        }
    }
}

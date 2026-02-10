
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TransactionService } from '../wallet/transaction.service';

@Injectable()
export class ScoresService {
    constructor(
        private prisma: PrismaService,
        private transactionService: TransactionService
    ) { }

    async create(userId: string, amount: number, game: string = 'neon-match') {
        // 1. Calculate Zoins (Server-Side Authority)
        // 100,000 points = 1 Zoin
        const zoinsEarned = amount / 100000;

        // 2. Security Check: High Volume Fraud Detection
        // Threshold: 0.5 Zoins (50,000 points) per game
        if (zoinsEarned > 0.5) {
            // FREEZE ACCOUNT
            await this.transactionService.freezeAccount(userId, 'Suspicious score activity: ' + amount);
            throw new Error('Puntuación inusualmente alta. Tu cuenta ha sido congelada por seguridad hasta revisión manual.');
        }

        // 3. Save Score
        const score = await this.prisma.score.create({
            data: {
                userId,
                amount,
                game,
            },
        });

        // 4. Secure Transaction (Credit Zoins)
        if (zoinsEarned > 0) {
            await this.transactionService.createTransaction(
                userId,
                zoinsEarned,
                'GAME_REWARD',
                `Reward for score: ${amount} in ${game}`
            );
        }

        return score;
    }

    async getTop(game: string = 'neon-match') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return this.prisma.score.findMany({
            where: {
                game,
                createdAt: {
                    gte: startOfMonth,
                },
            },
            include: {
                user: {
                    select: {
                        nombre: true,
                        username: true,
                        email: true,
                        membership: true,
                    },
                },
            },
            orderBy: {
                amount: 'desc',
            },
            take: 10,
        });
    }
}

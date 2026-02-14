import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TransactionService } from '../wallet/transaction.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ScoresService {
    constructor(
        private prisma: PrismaService,
        private transactionService: TransactionService,
        private usersService: UsersService
    ) { }

    async create(userId: string, amount: number, game: string = 'neon-match', zoins: number = 0) {
        // 1. Check Daily Limit
        const canPlay = await this.usersService.canPlay(userId);
        if (!canPlay) {
            throw new ForbiddenException('Has alcanzado tu límite diario de partidas. ¡Vuelve mañana o mejora tu plan!');
        }

        // 2. Zoins Verification (Security)
        const zoinsEarned = zoins;
        if (zoinsEarned > 0.5) {
            await this.transactionService.freezeAccount(userId, 'Suspicious zoin activity: ' + zoinsEarned + ' zoins in ' + game);
            throw new BadRequestException('Cantidad de Zoins inusualmente alta. Tu cuenta ha sido congelada por seguridad hasta revisión manual.');
        }

        // 3. Apply Membership Multipliers
        const user = await this.usersService.findOne(userId);
        let finalAmount = amount;

        if (user && user.membership === 'PERLA') {
            finalAmount = Math.floor(amount * 1.1); // 1.1x Multiplier
        }

        // 4. Save Score
        const score = await this.prisma.score.create({
            data: {
                userId,
                amount: finalAmount,
                game,
            },
        });

        // 5. Increment Daily Games Counter
        await this.usersService.incrementDailyGames(userId);

        // 6. Secure Transaction (Credit Zoins)
        if (zoinsEarned > 0) {
            await this.transactionService.createTransaction(
                userId,
                zoinsEarned,
                'GAME_REWARD',
                `Reward for score: ${finalAmount} (Zoins: ${zoinsEarned}) in ${game}`
            );
        }

        return score;
    }

    async getUserScores(userId: string) {
        return this.prisma.score.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
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
                        // nombre: true, // REMOVED
                        username: true,
                        // email: true, // Privacy?
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

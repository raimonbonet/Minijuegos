
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TransactionService } from '../wallet/transaction.service';

@Injectable()
export class RankingScheduler {
    private readonly logger = new Logger(RankingScheduler.name);

    constructor(
        private prisma: PrismaService,
        private transactionService: TransactionService
    ) { }

    // Run at 00:00 on the 1st day of every month
    @Cron('0 0 1 * *')
    async handleMonthlyReset() {
        this.logger.log('Starting monthly ranking reset and reward distribution...');

        // 1. Determine the previous month
        const now = new Date();
        const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Ensure we cover the entire previous month
        const endOfPreviousMonth = new Date(firstDayOfCurrentMonth.getTime() - 1);

        this.logger.log(`Processing rewards for period: ${firstDayOfPreviousMonth.toISOString()} - ${endOfPreviousMonth.toISOString()}`);

        // 2. Get Top Scores (Fetching 50 to ensure we cover ties at the 5th place boundary)
        const game = 'neon-match';
        const topScores = await this.prisma.score.findMany({
            where: {
                game,
                createdAt: {
                    gte: firstDayOfPreviousMonth,
                    lte: endOfPreviousMonth
                }
            },
            include: { user: true },
            orderBy: { amount: 'desc' },
            take: 50 // Fetch enough to handle ties
        });

        if (topScores.length === 0) {
            this.logger.log('No scores found for previous month.');
            return;
        }

        this.logger.log(`Found ${topScores.length} scores to process for ranking.`);

        // 3. Distribute Rewards with Tie Handling
        let currentRank = 1;

        for (let i = 0; i < topScores.length; i++) {
            const score = topScores[i];

            // Determine Rank: If same score as previous, same rank. Else, rank = i + 1 (standard competition ranking)
            if (i > 0 && score.amount < topScores[i - 1].amount) {
                currentRank = i + 1;
            }
            // If score.amount === topScores[i-1].amount, currentRank stays same.

            // Only reward top 5 ranks
            if (currentRank > 5) break;

            let reward = 0;
            if (currentRank === 1) reward = 3.00;
            else if (currentRank === 2) reward = 1.00;
            else if (currentRank >= 3 && currentRank <= 5) reward = 0.15;

            if (reward > 0) {
                try {
                    await this.transactionService.createTransaction(
                        score.userId,
                        reward,
                        'GAME_REWARD',
                        `Monthly Ranking Reward: Rank #${currentRank} in ${game} (${firstDayOfPreviousMonth.toLocaleString('default', { month: 'long' })})`
                    );
                    this.logger.log(`Rewarded user ${score.user.email} (Rank ${currentRank}, Score ${score.amount}) with ${reward} Zoins.`);
                } catch (error) {
                    this.logger.error(`Failed to reward user ${score.userId}: ${(error as Error).message}`);
                }
            }
        }

        this.logger.log('Monthly ranking rewards completed.');
    }
}

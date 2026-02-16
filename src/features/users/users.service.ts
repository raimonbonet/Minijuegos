import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
        console.log('UsersService initialized (Schema Updated)');
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: { wallet: true }
        });
    }

    async findOneByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findOneByGoogleId(googleId: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { googleId },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async updateProfile(id: string, data: Partial<User>): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async findOne(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: { wallet: true }
        });
    }

    // --- Daily Limits & Subscription Logic ---

    getDailyLimit(membership: string): number {
        switch (membership) {
            case 'FREE': return 3;
            case 'PALMERA': return 8;
            case 'CORAL': return 15;
            case 'PERLA': return 25;
            default: return 3;
        }
    }

    async canPlay(userId: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { membership: true, dailyGamesLeft: true, extraGames: true, isAdmin: true }
        });

        if (!user) return false;

        const limit = this.getDailyLimit(user.membership);

        // Allow play if games left > 0 OR has extra games
        return user.dailyGamesLeft > 0 || user.extraGames > 0;
    }

    async consumeDailyGame(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { membership: true, dailyGamesLeft: true, extraGames: true }
        });

        if (!user) return;

        if (user.dailyGamesLeft > 0) {
            // Consume daily free game
            await this.prisma.user.update({
                where: { id: userId },
                data: { dailyGamesLeft: { decrement: 1 } }
            });
        } else if (user.extraGames > 0) {
            // Consume extra game
            await this.prisma.user.update({
                where: { id: userId },
                data: { extraGames: { decrement: 1 } }
            });
        }
    }

    async resetAllDailyGames(): Promise<void> {
        // Reset Logic: Set dailyGamesLeft to the plan limit for each membership type

        // 1. FREE -> 3
        await this.prisma.user.updateMany({
            where: { membership: 'FREE' },
            data: { dailyGamesLeft: 3, lastDailyReset: new Date() }
        });

        // 2. PALMERA -> 8
        await this.prisma.user.updateMany({
            where: { membership: 'PALMERA' },
            data: { dailyGamesLeft: 8, lastDailyReset: new Date() }
        });

        // 3. CORAL -> 15
        await this.prisma.user.updateMany({
            where: { membership: 'CORAL' },
            data: { dailyGamesLeft: 15, lastDailyReset: new Date() }
        });

        // 4. PERLA -> 25
        await this.prisma.user.updateMany({
            where: { membership: 'PERLA' },
            data: { dailyGamesLeft: 25, lastDailyReset: new Date() }
        });

        console.log(`[UsersService] Daily games reset (refilled) for all users at ${new Date().toISOString()}`);
    }
    async changePassword(userId: string, newPasswordHash: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: newPasswordHash }
        });
    }
}

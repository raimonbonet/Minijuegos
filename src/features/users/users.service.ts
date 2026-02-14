import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

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
            select: { membership: true, dailyGamesPlayed: true, isAdmin: true }
        });

        if (!user) return false;
        if (user.isAdmin) return true; // Admins have unlimited games

        const limit = this.getDailyLimit(user.membership);
        return user.dailyGamesPlayed < limit;
    }

    async incrementDailyGames(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { dailyGamesPlayed: { increment: 1 } }
        });
    }

    async resetAllDailyGames(): Promise<void> {
        await this.prisma.user.updateMany({
            data: { dailyGamesPlayed: 0, lastDailyReset: new Date() }
        });
        console.log(`[UsersService] Daily games reset for all users at ${new Date().toISOString()}`);
    }
    async changePassword(userId: string, newPasswordHash: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: newPasswordHash }
        });
    }
}

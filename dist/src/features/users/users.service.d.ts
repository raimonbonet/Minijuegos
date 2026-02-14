import { PrismaService } from '../../shared/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOneByEmail(email: string): Promise<User | null>;
    findOneByUsername(username: string): Promise<User | null>;
    findOneByGoogleId(googleId: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    updateProfile(id: string, data: Partial<User>): Promise<User>;
    findOne(id: string): Promise<User | null>;
    getDailyLimit(membership: string): number;
    canPlay(userId: string): Promise<boolean>;
    incrementDailyGames(userId: string): Promise<void>;
    resetAllDailyGames(): Promise<void>;
    changePassword(userId: string, newPasswordHash: string): Promise<void>;
}

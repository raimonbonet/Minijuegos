import { PrismaService } from '../../shared/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOneByEmail(email: string): Promise<User | null>;
    findOneByUsername(username: string): Promise<User | null>;
    findOneByGoogleId(googleId: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    updateProfile(id: string, data: Partial<User>): Promise<User>;
    findOne(id: string): Promise<User | null>;
}

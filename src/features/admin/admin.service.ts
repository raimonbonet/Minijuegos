
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

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

        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                dni: true,
                Zoins: true,
                isAdmin: true,
                isFrozen: true, // Allow admin to see frozen status
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async unfreezeUser(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { isFrozen: false },
        });
    }

    async getAllScores(game?: string) {
        const where = game ? { game } : {};
        return this.prisma.score.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        nombre: true,
                        apellidos: true,
                    }
                }
            },

            orderBy: { amount: 'desc' },
            take: 100 // Limit to top 100 for safety, or implement pagination later
        });
    }

    async updateZoins(id: string, amount: number, mode: 'set' | 'add') {
        if (mode === 'set') {
            return this.prisma.user.update({
                where: { id },
                data: { Zoins: amount },
            });
        } else {
            return this.prisma.user.update({
                where: { id },
                data: { Zoins: { increment: amount } },
            });
        }
    }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
        console.log('UsersService initialized (Schema Updated)');
    }
    async findOneByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { wallet: true }
        });
    }
    async findOneByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }
    async findOneByGoogleId(googleId) {
        return this.prisma.user.findUnique({
            where: { googleId },
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    async updateProfile(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    async findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { wallet: true }
        });
    }
    getDailyLimit(membership) {
        switch (membership) {
            case 'FREE': return 3;
            case 'PALMERA': return 8;
            case 'CORAL': return 15;
            case 'PERLA': return 25;
            default: return 3;
        }
    }
    async canPlay(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { membership: true, dailyGamesLeft: true, extraGames: true, isAdmin: true }
        });
        if (!user)
            return false;
        const limit = this.getDailyLimit(user.membership);
        return user.dailyGamesLeft > 0 || user.extraGames > 0;
    }
    async consumeDailyGame(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { membership: true, dailyGamesLeft: true, extraGames: true }
        });
        if (!user)
            return;
        if (user.dailyGamesLeft > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { dailyGamesLeft: { decrement: 1 } }
            });
        }
        else if (user.extraGames > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { extraGames: { decrement: 1 } }
            });
        }
    }
    async resetAllDailyGames() {
        await this.prisma.user.updateMany({
            where: { membership: 'FREE' },
            data: { dailyGamesLeft: 3, lastDailyReset: new Date() }
        });
        await this.prisma.user.updateMany({
            where: { membership: 'PALMERA' },
            data: { dailyGamesLeft: 8, lastDailyReset: new Date() }
        });
        await this.prisma.user.updateMany({
            where: { membership: 'CORAL' },
            data: { dailyGamesLeft: 15, lastDailyReset: new Date() }
        });
        await this.prisma.user.updateMany({
            where: { membership: 'PERLA' },
            data: { dailyGamesLeft: 25, lastDailyReset: new Date() }
        });
        console.log(`[UsersService] Daily games reset (refilled) for all users at ${new Date().toISOString()}`);
    }
    async changePassword(userId, newPasswordHash) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: newPasswordHash }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
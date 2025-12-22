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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const client_1 = require("@prisma/client");
let WalletService = class WalletService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWallet(userId) {
        return this.prisma.wallet.create({
            data: {
                userId,
                balance: 0,
            },
        });
    }
    async getWalletByUserId(userId) {
        return this.prisma.wallet.findUnique({
            where: { userId },
        });
    }
    async updateBalance(userId, amount, type, description) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            const newBalance = new client_1.Prisma.Decimal(wallet.balance).add(amount);
            if (newBalance.lt(0)) {
                throw new Error('Insufficient funds');
            }
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: newBalance },
            });
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type,
                    description,
                },
            });
            return updatedWallet;
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map
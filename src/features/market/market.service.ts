import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class MarketService {
    constructor(
        private usersService: UsersService,
        private walletService: WalletService,
    ) { }

    async buyItem(userId: string, itemId: string, payload?: any) {
        const user = await this.usersService.findOne(userId);
        if (!user) throw new BadRequestException('User not found');

        let cost = 0;
        let action = async () => { };

        let description = '';

        switch (itemId) {
            case 'change-username':
                cost = 5;
                description = 'Cambio de Nombre';
                if (!payload?.newUsername) throw new BadRequestException('New username required');
                action = async () => {
                    await this.usersService.update(userId, { username: payload.newUsername });
                };
                break;
            case 'pack-20':
                cost = 0.50;
                description = 'Pack 20 Partidas';
                action = async () => {
                    await this.usersService.update(userId, { extraGames: { increment: 20 } });
                };
                break;
            case 'pack-50':
                cost = 1.00;
                description = 'Pack 50 Partidas';
                action = async () => {
                    await this.usersService.update(userId, { extraGames: { increment: 50 } });
                };
                break;
            default:
                throw new BadRequestException('Invalid item ID');
        }

        // Check balance (WalletService handles the transaction and check)
        // We will perform the transaction first. If it fails (insufficient funds), it throws.

        await this.walletService.updateBalance(
            userId,
            -cost,
            TransactionType.PAYMENT,
            description
        );

        // If payment successful, apply effect
        try {
            await action();
            return { success: true, message: `Purchased ${itemId}` };
        } catch (error: any) {
            console.error('Error applying purchase effect:', userId, itemId, error);

            // Refund the user if the action failed
            await this.walletService.updateBalance(
                userId,
                cost,
                TransactionType.REFUND,
                `Refund: Failed purchase ${itemId}`
            );

            if (error.code === 'P2002') {
                throw new BadRequestException('El nombre de usuario ya está en uso.');
            }
            throw new BadRequestException('Error al procesar la compra. Se ha reembolsado el importe.');
        }
    }
}

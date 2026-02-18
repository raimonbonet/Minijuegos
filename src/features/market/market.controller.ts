import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketController {
    constructor(private marketService: MarketService) { }

    @Post('buy')
    async buyItem(@Request() req, @Body() body: { itemId: string; payload?: any }) {
        return this.marketService.buyItem(req.user.userId, body.itemId, body.payload);
    }

    @Post('purchase-zoins')
    async purchaseZoins(@Request() req, @Body() body: { packId: string }) {
        return this.marketService.purchaseZoins(req.user.userId, body.packId);
    }
}

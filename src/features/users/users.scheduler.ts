import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';

@Injectable()
export class UsersScheduler {
    constructor(private readonly usersService: UsersService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyReset() {
        console.log('[UsersScheduler] Running daily reset task...');
        await this.usersService.resetAllDailyGames();
    }
}

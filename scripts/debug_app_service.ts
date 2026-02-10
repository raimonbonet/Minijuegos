
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminService } from '../src/features/admin/admin.service';
import { PrismaService } from '../src/shared/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const prismaService = app.get(PrismaService);
    const adminService = app.get(AdminService);

    console.log('--- DEBUG USER CONTEXT ---');
    // Check DB URL (masked)
    // We can't easily access the internal URL property of PrismaService/Client, 
    // but we can check if it works.

    try {
        console.log('Checking connection...');
        await prismaService.$connect();
        console.log('Connected to DB.');

        console.log('Fetching scores via AdminService (no filter)...');
        const scores = await adminService.getAllScores();
        console.log(`AdminService returned ${scores.length} scores.`);
        if (scores.length > 0) {
            console.log('Sample:', scores[0]);
        } else {
            console.log('WARNING: No scores returned by service!');
        }

        console.log('Fetching scores via PrismaService direct...');
        const prismaScores = await prismaService.score.findMany();
        console.log(`PrismaService direct found ${prismaScores.length} scores.`);

    } catch (error) {
        console.error('ERROR:', error);
    }

    await app.close();
}

bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/features/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/shared/prisma/prisma.service';

async function bootstrap() {
    // 1. Create App Context to generate Token
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const jwtService = app.get(JwtService);
    const prisma = app.get(PrismaService);

    const user = await prisma.user.findFirst({ where: { email: 'raimonbonet@gmail.com' } });
    if (!user) throw new Error('User not found');

    const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
    const token = await jwtService.signAsync(payload);
    console.log('Generated Token for:', user.email);

    await app.close();

    // 2. Make HTTP Request using fetch (Node 18+)
    console.log('Connecting to http://localhost:3000/admin/rankings-list ...');
    try {
        const response = await fetch('http://localhost:3000/admin/rankings-list?game=neon-match', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text.substring(0, 500)); // Print first 500 chars

    } catch (e) {
        console.error('HTTP Request Failed:', e);
    }
}

bootstrap();

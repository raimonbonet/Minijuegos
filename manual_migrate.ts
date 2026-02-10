import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('Setting admin user...');
    try {
        const result = await prisma.user.update({
            where: { email: 'raimonbonet@gmail.com' },
            data: { isAdmin: true },
        });
        console.log('Admin updated:', result);
    } catch (e) {
        console.log('Set admin failed (maybe user not found?):', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

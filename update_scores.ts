import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const result = await prisma.score.updateMany({
        where: {
            game: 'neon-match'
        },
        data: {
            game: 'bloques-tropicales'
        }
    });

    console.log(`Updated ${result.count} score records from neon-match to bloques-tropicales.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

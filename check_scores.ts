import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Checking scores...');

    const allScores = await prisma.score.findMany({
        take: 5,
        include: { user: true }
    });
    console.log('All Scores (first 5):', JSON.stringify(allScores, null, 2));

    const neonMatchScores = await prisma.score.findMany({
        where: { game: 'neon-match' },
        take: 5
    });
    console.log('Neon Match Scores:', neonMatchScores.length);

    const count = await prisma.score.count();
    console.log('Total Scores:', count);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('Checking scores...');
    const user = await prisma.user.findFirst({ where: { email: 'raimonbonet@gmail.com' } });
    console.log(`User raimonbonet is admin? ${user?.isAdmin}`);

    console.log('Testing AdminService query logic (game="neon-match")...');
    const scores = await prisma.score.findMany({
        where: { game: 'neon-match' },
        include: {
            user: {
                select: {
                    email: true,
                    nombre: true,
                    apellidos: true,
                }
            }
        },
        orderBy: { amount: 'desc' },
        take: 100
    });
    console.log(`Found ${scores.length} scores with filter.`);
    if (scores.length > 0) {
        console.log('Sample:', scores[0]);
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

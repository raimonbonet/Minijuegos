
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email to delete.');
        process.exit(1);
    }

    try {
        const user = await prisma.user.delete({
            where: { email },
        });
        console.log(`User ${email} deleted successfully.`);
    } catch (e) {
        if (e.code === 'P2025') {
            console.log(`User ${email} not found.`);
        } else {
            console.error(e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();

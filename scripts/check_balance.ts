
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Checking User Balances and Transactions...');

    // Get all users with their wallet and transactions
    const users = await prisma.user.findMany({
        include: {
            wallet: {
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            }
        }
    });

    if (users.length === 0) {
        console.log('No users found.');
        return;
    }

    users.forEach(user => {
        console.log(`\nUser: ${user.email} (${user.id})`);
        console.log(`User.Zoins: ${user.Zoins}`);
        if (user.wallet) {
            console.log(`Wallet.balance: ${user.wallet.balance}`);
            console.log(`Recent Transactions:`);
            user.wallet.transactions.forEach(t => {
                console.log(`  - [${t.type}] ${t.amount} Z - ${t.description} (Signature: ${t.signature ? 'Verified' : 'Missing'})`);
            });
        } else {
            console.log('No wallet found.');
        }
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

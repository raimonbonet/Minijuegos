import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
    console.log('Connecting to DB via pg...');
    // Use DIRECT_URL for migrations/scripts if available, or DATABASE_URL
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('No connection string found');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase usually
    });

    try {
        await client.connect();
        console.log('Connected.');

        const res = await client.query(`UPDATE "User" SET "isAdmin" = true WHERE email = 'raimonbonet@gmail.com'`);
        console.log('Update result:', res.rowCount);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

main();

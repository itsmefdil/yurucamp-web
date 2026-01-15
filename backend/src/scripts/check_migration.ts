import { client } from '../db';

async function checkMigrationStatus() {
    try {
        console.log('Checking database state...');

        // 1. Check if columns are text
        const result = await client`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activities' AND column_name = 'id';
        `;

        if (result.length > 0) {
            console.log(`activities.id type: ${result[0].data_type}`);
        }

        // 2. Check migration table
        const migrations = await client`
            SELECT * FROM "drizzle"."__drizzle_migrations" ORDER BY created_at DESC;
        `;

        console.log('Recorded migrations:', migrations.length);
        migrations.forEach(m => console.log(`- ${m.hash}`)); // Drizzle uses hash, but file names are usually part of the internal tracking or just hash.

        // Actually Drizzle Kit stores the hash of the migration file. 
        // If we want to skip it, we need to insert the record with the correct hash.
        // But calculating the hash exactly like Drizzle does might be tricky without their tool.

        // Alternative: If the DB is already migrated, we can comment out the SQL in 0006 temporarily, run migrate, then uncomment?
        // Or better, just let the user know what's happening.

    } catch (err) {
        console.error('Error checking status:', err);
    } finally {
        await client.end();
    }
}

checkMigrationStatus();

import { client } from '../db';

async function fixMigrationRecord() {
    try {
        console.log('Fixing migration record...');

        // Delete the latest migration record (assuming it's the broken/old 0006)
        // We will select it first to be sure
        const latest = await client`
            SELECT id, hash, created_at FROM "drizzle"."__drizzle_migrations" ORDER BY created_at DESC LIMIT 1;
        `;

        if (latest.length > 0) {
            console.log('Deleting execution record for migration:', latest[0]);
            await client`
                DELETE FROM "drizzle"."__drizzle_migrations" WHERE id = ${latest[0].id};
            `;
            console.log('Deleted. Now you can run "npm run migrate" to re-apply the corrected migration file.');
        } else {
            console.log('No migrations found to delete.');
        }

    } catch (err) {
        console.error('Error fixing record:', err);
    } finally {
        await client.end();
    }
}

fixMigrationRecord();

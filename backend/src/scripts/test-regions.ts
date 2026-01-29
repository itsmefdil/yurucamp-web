
import { db } from '../db';
import { regions, regionMembers } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
    console.log('Testing regions query with Left Join...');
    try {
        const result = await db.select({
            id: regions.id,
            name: regions.name,
            memberCount: sql<number>`count(${regionMembers.id})::int`,
        }).from(regions)
            .leftJoin(regionMembers, eq(regionMembers.regionId, regions.id))
            .where(eq(regions.status, 'active'))
            .groupBy(regions.id)
            .limit(5);

        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

main();

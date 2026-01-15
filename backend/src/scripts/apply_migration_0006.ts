import { db, client } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Starting migration 0006 (Corrected)...');
    try {
        // 1. Drop Foreign Key Constraints
        console.log('Dropping constraints...');
        await db.execute(sql`ALTER TABLE "activity_comments" DROP CONSTRAINT IF EXISTS "activity_comments_activity_id_activities_id_fk"`);
        await db.execute(sql`ALTER TABLE "activity_likes" DROP CONSTRAINT IF EXISTS "activity_likes_activity_id_activities_id_fk"`);
        await db.execute(sql`ALTER TABLE "event_participants" DROP CONSTRAINT IF EXISTS "event_participants_event_id_events_id_fk"`);
        await db.execute(sql`ALTER TABLE "gear_categories" DROP CONSTRAINT IF EXISTS "gear_categories_gear_list_id_gear_lists_id_fk"`);

        // 2. Change Column Types (FKs first, or PKs? Both need to be text)
        // Order shouldn't matter as much now that links are broken, but let's do FKs then PKs or vice versa.
        console.log('Changing column types...');

        await db.execute(sql`ALTER TABLE "activity_comments" ALTER COLUMN "activity_id" SET DATA TYPE text`);
        await db.execute(sql`ALTER TABLE "activity_likes" ALTER COLUMN "activity_id" SET DATA TYPE text`);
        await db.execute(sql`ALTER TABLE "event_participants" ALTER COLUMN "event_id" SET DATA TYPE text`);
        await db.execute(sql`ALTER TABLE "gear_categories" ALTER COLUMN "gear_list_id" SET DATA TYPE text`);

        await db.execute(sql`ALTER TABLE "activities" ALTER COLUMN "id" SET DATA TYPE text`);
        await db.execute(sql`ALTER TABLE "activities" ALTER COLUMN "id" DROP DEFAULT`);

        await db.execute(sql`ALTER TABLE "camp_areas" ALTER COLUMN "id" SET DATA TYPE text`);
        await db.execute(sql`ALTER TABLE "camp_areas" ALTER COLUMN "id" DROP DEFAULT`);

        await db.execute(sql`ALTER TABLE "events" ALTER COLUMN "id" SET DATA TYPE text`);
        await db.execute(sql`ALTER TABLE "events" ALTER COLUMN "id" DROP DEFAULT`);

        await db.execute(sql`ALTER TABLE "gear_lists" ALTER COLUMN "id" SET DATA TYPE text`);
        await db.execute(sql`ALTER TABLE "gear_lists" ALTER COLUMN "id" DROP DEFAULT`);

        // 3. Re-add Foreign Key Constraints
        console.log('Re-adding constraints...');
        await db.execute(sql`ALTER TABLE "activity_comments" ADD CONSTRAINT "activity_comments_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE cascade`);
        await db.execute(sql`ALTER TABLE "activity_likes" ADD CONSTRAINT "activity_likes_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE cascade`);
        await db.execute(sql`ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE cascade`);
        await db.execute(sql`ALTER TABLE "gear_categories" ADD CONSTRAINT "gear_categories_gear_list_id_gear_lists_id_fk" FOREIGN KEY ("gear_list_id") REFERENCES "gear_lists"("id") ON DELETE cascade`);

        console.log('Migration 0006 applied successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.end();
    }
}

main();

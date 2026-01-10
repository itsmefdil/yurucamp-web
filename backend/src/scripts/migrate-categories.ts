import { db } from '../db';
import { sql } from 'drizzle-orm';

async function runMigration() {
    try {
        console.log('Starting manual migration...');

        // Step 1: Add category_id column
        console.log('Step 1: Adding category_id column...');
        await db.execute(sql`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "category_id" uuid`);

        // Step 2: Add foreign key constraint
        console.log('Step 2: Adding foreign key constraint...');
        await db.execute(sql`
            DO $$ BEGIN
                ALTER TABLE "activities" ADD CONSTRAINT "activities_category_id_categories_id_fk" 
                FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Step 3: Migrate data from category (text) to category_id (uuid)
        console.log('Step 3: Migrating data...');

        // Camping
        await db.execute(sql`
            UPDATE activities 
            SET category_id = (SELECT id FROM categories WHERE name = 'Camping')
            WHERE LOWER(category) = 'camping'
        `);

        // Hiking
        await db.execute(sql`
            UPDATE activities 
            SET category_id = (SELECT id FROM categories WHERE name = 'Hiking')
            WHERE LOWER(category) = 'hiking'
        `);

        // Fishing
        await db.execute(sql`
            UPDATE activities 
            SET category_id = (SELECT id FROM categories WHERE name = 'Fishing')
            WHERE LOWER(category) = 'fishing'
        `);

        // Glamping
        await db.execute(sql`
            UPDATE activities 
            SET category_id = (SELECT id FROM categories WHERE name = 'Glamping')
            WHERE LOWER(category) = 'glamping'
        `);

        // Other
        await db.execute(sql`
            UPDATE activities 
            SET category_id = (SELECT id FROM categories WHERE name = 'Other')
            WHERE LOWER(category) IN ('other', 'lainnya')
        `);

        // Step 4: Drop old category column
        console.log('Step 4: Dropping old category column...');
        await db.execute(sql`ALTER TABLE "activities" DROP COLUMN IF EXISTS "category"`);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

runMigration();

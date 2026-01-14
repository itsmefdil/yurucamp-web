import { db } from '../db';
import { activities, categories } from '../db/schema';
import { isNull } from 'drizzle-orm';

async function fixNullCategories() {
    try {
        console.log('Checking for activities with null categoryId...');

        // Get all activities with null categoryId
        const nullCategoryActivities = await db.select().from(activities).where(isNull(activities.categoryId));
        console.log(`Found ${nullCategoryActivities.length} activities with null categoryId`);

        if (nullCategoryActivities.length === 0) {
            console.log('No activities to fix!');
            process.exit(0);
            return;
        }

        // Get the "Other" category as default
        const allCategories = await db.select().from(categories);
        const otherCategory = allCategories.find(cat => cat.name.toLowerCase() === 'other');

        if (!otherCategory) {
            console.error('Could not find "Other" category!');
            process.exit(1);
            return;
        }

        console.log(`Will set all null categories to: ${otherCategory.name} (${otherCategory.id})`);

        // Update all null categoryId to "Other"
        for (const activity of nullCategoryActivities) {
            await db.update(activities)
                .set({ categoryId: otherCategory.id })
                .where(isNull(activities.categoryId));
            console.log(`Updated activity: ${activity.title}`);
        }

        console.log('\nAll activities with null categoryId have been updated!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing null categories:', error);
        process.exit(1);
    }
}

fixNullCategories();

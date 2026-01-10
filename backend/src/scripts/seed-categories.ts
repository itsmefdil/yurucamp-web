import { db } from '../db';
import { categories } from '../db/schema';

const initialCategories = [
    { name: 'Camping' },
    { name: 'Hiking' },
    { name: 'Fishing' },
    { name: 'Glamping' },
    { name: 'Other' },
];

async function seedCategories() {
    try {
        console.log('Seeding categories...');

        for (const category of initialCategories) {
            await db.insert(categories).values(category).onConflictDoNothing();
        }

        console.log('Categories seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();

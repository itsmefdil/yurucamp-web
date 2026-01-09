import { db, client } from '../db';
import { users, activities, campAreas, events, activityComments, activityLikes, eventParticipants } from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

async function deleteAllData() {
    try {
        console.log('🗑️  Starting database cleanup...\n');

        // Delete in correct order (respecting foreign key constraints)
        console.log('🔄 Deleting event participants...');
        await db.delete(eventParticipants);
        console.log('✅ Event participants deleted\n');

        console.log('🔄 Deleting activity likes...');
        await db.delete(activityLikes);
        console.log('✅ Activity likes deleted\n');

        console.log('🔄 Deleting activity comments...');
        await db.delete(activityComments);
        console.log('✅ Activity comments deleted\n');

        console.log('🔄 Deleting activities...');
        await db.delete(activities);
        console.log('✅ Activities deleted\n');

        console.log('🔄 Deleting events...');
        await db.delete(events);
        console.log('✅ Events deleted\n');

        console.log('🔄 Deleting camp areas...');
        await db.delete(campAreas);
        console.log('✅ Camp areas deleted\n');

        console.log('🔄 Deleting users...');
        await db.delete(users);
        console.log('✅ Users deleted\n');

        console.log('🎉 All data deleted successfully!\n');

    } catch (error) {
        console.error('❌ Error deleting data:', error);
        process.exit(1);
    } finally {
        await client.end();
        process.exit(0);
    }
}

deleteAllData();

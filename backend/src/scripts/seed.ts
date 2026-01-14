import { db, client } from '../db';
import { users, activities, campAreas, events } from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Insert dummy users
        console.log('👥 Inserting users...');
        const insertedUsers = await db.insert(users).values([
            {
                email: 'admin@yurucamp.id',
                fullName: 'Admin YuruCamp',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                googleId: null,
            },
            {
                email: 'nadeshiko@yurucamp.id',
                fullName: 'Nadeshiko Kagamihara',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nadeshiko',
                googleId: null,
            },
            {
                email: 'rin@yurucamp.id',
                fullName: 'Rin Shima',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rin',
                googleId: null,
            },
        ]).returning();
        console.log(`✅ Inserted ${insertedUsers.length} users\n`);

        // Insert dummy camp areas
        console.log('🏕️  Inserting camp areas...');
        const insertedCampAreas = await db.insert(campAreas).values([
            {
                name: 'Gunung Bromo',
                location: 'Jawa Timur',
                description: 'Camping di kaki Gunung Bromo dengan pemandangan sunrise yang spektakuler',
                imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
                facilities: ['Toilet', 'Parkir', 'Warung'],
            },
            {
                name: 'Ranca Upas',
                location: 'Bandung, Jawa Barat',
                description: 'Area camping dengan suhu dingin dan pemandangan pegunungan',
                imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
                facilities: ['Toilet', 'Mushola', 'Parkir', 'Penginapan'],
            },
            {
                name: 'Pantai Sawarna',
                location: 'Banten',
                description: 'Camping di tepi pantai dengan ombak yang tenang',
                imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800',
                facilities: ['Toilet', 'Warung', 'Parkir'],
            },
        ]).returning();
        console.log(`✅ Inserted ${insertedCampAreas.length} camp areas\n`);

        // Insert dummy activities
        console.log('🎯 Inserting activities...');
        const insertedActivities = await db.insert(activities).values([
            {
                userId: insertedUsers[0].id,
                title: 'Camping Perdana di Bromo',
                description: 'Pengalaman camping pertama kali di Gunung Bromo. Sunrise-nya luar biasa!',
                location: 'Gunung Bromo, Jawa Timur',
                date: '2024-01-15',
                imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
            },
            {
                userId: insertedUsers[1].id,
                title: 'Weekend di Ranca Upas',
                description: 'Camping bareng teman-teman di Ranca Upas. Dingin tapi seru!',
                location: 'Ranca Upas, Bandung',
                date: '2024-02-20',
                imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
            },
            {
                userId: insertedUsers[2].id,
                title: 'Solo Camping di Pantai',
                description: 'Menikmati ketenangan pantai dengan camping sendirian',
                location: 'Pantai Sawarna, Banten',
                date: '2024-03-10',
                imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800',
            },
        ]).returning();
        console.log(`✅ Inserted ${insertedActivities.length} activities\n`);

        // Insert dummy events
        console.log('📅 Inserting events...');
        const insertedEvents = await db.insert(events).values([
            {
                title: 'YuruCamp Meetup Jakarta',
                description: 'Gathering komunitas camping Jakarta. Sharing pengalaman dan tips camping!',
                location: 'Jakarta',
                dateStart: '2024-06-01',
                dateEnd: '2024-06-02',
                imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
                maxParticipants: 50,
            },
            {
                title: 'Camping Bareng ke Bromo',
                description: 'Trip camping bareng ke Gunung Bromo. Kuota terbatas!',
                location: 'Gunung Bromo, Jawa Timur',
                dateStart: '2024-07-15',
                dateEnd: '2024-07-17',
                imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
                maxParticipants: 30,
            },
        ]).returning();
        console.log(`✅ Inserted ${insertedEvents.length} events\n`);

        console.log('🎉 Database seeding completed successfully!\n');
        console.log('Summary:');
        console.log(`  - Users: ${insertedUsers.length}`);
        console.log(`  - Camp Areas: ${insertedCampAreas.length}`);
        console.log(`  - Activities: ${insertedActivities.length}`);
        console.log(`  - Events: ${insertedEvents.length}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.end();
        process.exit(0);
    }
}

seed();

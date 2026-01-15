import express from 'express';
import { db } from '../db';
import { users, regionMembers, regions, activities, gearLists } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getLevelName } from '../utils/exp';

const router = express.Router();

// GET public user profile
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.select({
            id: users.id,
            fullName: users.fullName,
            avatarUrl: users.avatarUrl,
            bio: users.bio,
            level: users.level,
            exp: users.exp,
            createdAt: users.createdAt,
        }).from(users).where(eq(users.id, id)).limit(1);

        if (result.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const user = {
            ...result[0],
            levelName: getLevelName(result[0].level || 1),
        };

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// GET user's joined regions
router.get('/:id/regions', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.select({
            id: regions.id,
            name: regions.name,
            slug: regions.slug,
            imageUrl: regions.imageUrl,
        })
            .from(regionMembers)
            .innerJoin(regions, eq(regionMembers.regionId, regions.id))
            .where(eq(regionMembers.userId, id))
            .orderBy(desc(regionMembers.createdAt));

        res.json(result);
    } catch (error) {
        console.error('Error fetching user regions:', error);
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
});

// GET user's public gear lists
router.get('/:id/gear-lists', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.select({
            id: gearLists.id,
            name: gearLists.name,
            description: gearLists.description,
            createdAt: gearLists.createdAt,
        })
            .from(gearLists)
            .where(and(eq(gearLists.userId, id), eq(gearLists.isPublic, true)))
            .orderBy(desc(gearLists.createdAt));

        res.json(result);
    } catch (error) {
        console.error('Error fetching user gear lists:', error);
        res.status(500).json({ error: 'Failed to fetch gear lists' });
    }
});

// GET user's activities
router.get('/:id/activities', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.select({
            id: activities.id,
            title: activities.title,
            description: activities.description,
            imageUrl: activities.imageUrl,
            date: activities.date,
            location: activities.location,
            createdAt: activities.createdAt,
        })
            .from(activities)
            .where(eq(activities.userId, id))
            .orderBy(desc(activities.createdAt));

        res.json(result);
    } catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

export default router;

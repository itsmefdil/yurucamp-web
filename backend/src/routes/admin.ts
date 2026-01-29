import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, campAreas, activities, events, regions, regionMembers } from '../db/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

// Middleware: Must be authenticated AND admin
router.use(authenticate, isAdmin);

// GET /admin/users - List all users
router.get('/users', async (req: Request, res: Response) => {
    try {
        const allUsers = await db.select().from(users).orderBy(desc(users.updatedAt));
        res.json(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /admin/users/:id - Update user (role, level, exp)
router.put('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role, level, exp } = req.body;

        // Basic validation
        if (role && !['user', 'admin'].includes(role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }

        const updateData: any = {};
        if (role) updateData.role = role;
        if (level !== undefined) updateData.level = parseInt(level);
        if (exp !== undefined) updateData.exp = parseInt(exp);
        updateData.updatedAt = new Date().toISOString();

        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();

        if (updatedUser.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(updatedUser[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/stats - Dashboard stats
// GET /admin/stats - Dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
    try {
        // Counts
        const userCountPromise = db.select({ value: count() }).from(users);
        const campCountPromise = db.select({ value: count() }).from(campAreas);
        const activityCountPromise = db.select({ value: count() }).from(activities);
        const eventCountPromise = db.select({ value: count() }).from(events);

        const [userCountRes, campCountRes, activityCountRes, eventCountRes] = await Promise.all([
            userCountPromise,
            campCountPromise,
            activityCountPromise,
            eventCountPromise
        ]);

        const userCount = userCountRes[0].value;
        const campCount = campCountRes[0].value;
        const activityCount = activityCountRes[0].value;
        const eventCount = eventCountRes[0].value;

        // Content Distribution for Pie Chart
        const contentStats = [
            { name: 'Camp Areas', value: campCount },
            { name: 'Activities', value: activityCount },
            { name: 'Events', value: eventCount }
        ];

        // User Growth (Last 30 days) - This requires raw SQL for date truncation usually
        // For simplicity with Drizzle/SQLite/Postgres differences, let's just fetch all createdAts and process in memory if small
        // But better to use SQL. Assuming Postgres based on pgTable:
        // Note: Drizzle sql operator usage.

        // Since we just added createdAt, most will be 'today'. 
        // We will mock some growth data if implementation is strictly for demo, 
        // but let's try to query it for correctness.
        // Actually, let's keep it simple: just return the counts for now, and maybe a mocked growth if empty?
        // No, let's try to get actual data.

        // Fetch users from last 30 days for daily growth chart
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const recentUsers = await db.select({ createdAt: users.createdAt })
            .from(users);

        // Count users per day
        const growthMap = new Map<string, number>();
        recentUsers.forEach(u => {
            if (!u.createdAt) return;
            // Handle PostgreSQL timestamp: "2026-01-29 12:39:22.063728+00"
            const dateStr = String(u.createdAt);
            if (dateStr < thirtyDaysAgo.toISOString()) return;

            const date = dateStr.split('T')[0]; // YYYY-MM-DD
            // If format is like "2026-01-29 12:..." splitting by T might verify if it is ISO or space separated
            // Postgres default might be space. Let's handle both.
            const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];

            growthMap.set(cleanDate, (growthMap.get(cleanDate) || 0) + 1);
        });

        // Generate last 30 days with 0 for days without new users
        const userGrowth: Array<{ date: string; count: number }> = [];
        for (let i = 30; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            userGrowth.push({
                date: dateStr,
                count: growthMap.get(dateStr) || 0
            });
        }

        res.json({
            userCount,
            activeInfo: {
                campCount,
                activityCount,
                eventCount
            },
            contentStats,
            userGrowth
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/camp-areas - List all camp areas
router.get('/camp-areas', async (req: Request, res: Response) => {
    try {
        const allCampAreas = await db.select({
            id: campAreas.id,
            name: campAreas.name,
            location: campAreas.location,
            price: campAreas.price,
            userId: campAreas.userId,
            createdAt: campAreas.createdAt,
            user: {
                fullName: users.fullName
            }
        })
            .from(campAreas)
            .leftJoin(users, eq(campAreas.userId, users.id))
            .orderBy(desc(campAreas.createdAt));

        res.json(allCampAreas);
    } catch (error) {
        console.error('Error fetching camp areas:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /admin/camp-areas/:id
router.delete('/camp-areas/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.delete(campAreas).where(eq(campAreas.id, id));
        res.json({ message: 'Camp area deleted' });
    } catch (error) {
        console.error('Error deleting camp area:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/regions - List all regions (active, pending, rejected)
router.get('/regions', async (req: Request, res: Response) => {
    try {
        const query = db.select({
            id: regions.id,
            name: regions.name,
            slug: regions.slug,
            description: regions.description,
            imageUrl: regions.imageUrl,
            status: regions.status,
            createdAt: regions.createdAt,
            creator: {
                id: users.id,
                fullName: users.fullName,
                email: users.email
            },
            memberCount: sql<number>`(SELECT COUNT(*)::int FROM ${regionMembers} WHERE ${regionMembers.regionId} = ${regions.id})`
        })
            .from(regions)
            .leftJoin(regionMembers, and(eq(regionMembers.regionId, regions.id), eq(regionMembers.role, 'admin')))
            .leftJoin(users, eq(regionMembers.userId, users.id))
            .orderBy(desc(regions.createdAt));

        const allRegions = await query;
        res.json(allRegions);
    } catch (error) {
        console.error('Error fetching admin regions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

// GET /admin/events - List all events
router.get('/events', async (req: Request, res: Response) => {
    try {
        const allEvents = await db.select({
            id: events.id,
            title: events.title,
            location: events.location,
            dateStart: events.dateStart,
            userId: events.organizerId, // Assuming organizerId links to user
            createdAt: events.createdAt,
            organizer: {
                fullName: users.fullName
            }
        })
            .from(events)
            .leftJoin(users, eq(events.organizerId, users.id))
            .orderBy(desc(events.createdAt));

        res.json(allEvents);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /admin/events/:id
router.delete('/events/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.delete(events).where(eq(events.id, id));
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/activities - List all activities
router.get('/activities', async (req: Request, res: Response) => {
    try {
        const allActivities = await db.select({
            id: activities.id,
            title: activities.title,
            location: activities.location,
            date: activities.date,
            userId: activities.userId,
            createdAt: activities.createdAt,
            user: {
                fullName: users.fullName
            }
        })
            .from(activities)
            .leftJoin(users, eq(activities.userId, users.id))
            .orderBy(desc(activities.createdAt));

        res.json(allActivities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /admin/activities/:id
router.delete('/activities/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.delete(activities).where(eq(activities.id, id));
        res.json({ message: 'Activity deleted' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

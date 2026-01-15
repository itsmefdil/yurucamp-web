
import express from 'express';
import { db } from '../db';
import { regions, regionMembers, users, activities } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = express.Router();


// GET pending regions (Admin only)
router.get('/pending', authenticate, async (req, res) => {
    try {
        const requesterId = req.user.sub || req.user.id;

        // Verify superadmin
        const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);
        if (superAdmin.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const result = await db.select({
            id: regions.id,
            name: regions.name,
            slug: regions.slug,
            description: regions.description,
            imageUrl: regions.imageUrl,
            coverUrl: regions.coverUrl,
            status: regions.status,
            createdAt: regions.createdAt,
            creator: {
                id: users.id,
                fullName: users.fullName,
                email: users.email,
                avatarUrl: users.avatarUrl,
            },
            memberCount: sql<number>`(SELECT COUNT(*)::int FROM ${regionMembers} WHERE ${regionMembers.regionId} = ${regions.id})`,
        })
            .from(regions)
            .leftJoin(regionMembers, and(eq(regionMembers.regionId, regions.id), eq(regionMembers.role, 'admin')))
            .leftJoin(users, eq(regionMembers.userId, users.id))
            .where(eq(regions.status, 'pending'))
            .orderBy(desc(regions.createdAt));

        res.json(result);
    } catch (error) {
        console.error('Error fetching pending regions:', error);
        res.status(500).json({ error: 'Failed to fetch pending regions' });
    }
});

// GET all regions with member count
router.get('/', async (req, res) => {
    try {
        const result = await db.select({
            id: regions.id,
            name: regions.name,
            slug: regions.slug,
            description: regions.description,
            imageUrl: regions.imageUrl,
            coverUrl: regions.coverUrl,
            createdAt: regions.createdAt,
            memberCount: sql<number>`(SELECT COUNT(*)::int FROM ${regionMembers} WHERE ${regionMembers.regionId} = ${regions.id})`,
        }).from(regions)
            .where(eq(regions.status, 'active')) // Only show active regions by default
            .orderBy(regions.name);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
});

// GET region by slug with member count
router.get('/by-slug/:slug', optionalAuthenticate, async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await db.select({
            id: regions.id,
            name: regions.name,
            slug: regions.slug,
            description: regions.description,
            imageUrl: regions.imageUrl,
            coverUrl: regions.coverUrl,
            status: regions.status,
            createdAt: regions.createdAt,
            memberCount: sql<number>`(SELECT COUNT(*)::int FROM ${regionMembers} WHERE ${regionMembers.regionId} = ${regions.id})`,
        }).from(regions).where(eq(regions.slug, slug)).limit(1);

        if (result.length === 0) {
            res.status(404).json({ error: 'Region not found' });
            return;
        }

        const region = result[0];

        // Access Control: If pending/rejected, only allow Creator/Admin
        if (region.status !== 'active') {
            let authorized = false;

            if (req.user) {
                const userId = req.user.sub || req.user.id;

                // Check if superadmin
                const superAdmin = await db.select().from(users)
                    .where(and(eq(users.id, userId), eq(users.role, 'admin')))
                    .limit(1);

                if (superAdmin.length > 0) {
                    authorized = true;
                } else {
                    // Check if region admin (creator)
                    const member = await db.select().from(regionMembers)
                        .where(and(eq(regionMembers.regionId, region.id), eq(regionMembers.userId, userId), eq(regionMembers.role, 'admin')))
                        .limit(1);

                    if (member.length > 0) {
                        authorized = true;
                    }
                }
            }

            if (!authorized) {
                res.status(404).json({ error: 'Region not found' }); // Hide existence
                return;
            }
        }

        res.json(region);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch region' });
    }
});

// GET region members
router.get('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.select({
            id: users.id,
            fullName: users.fullName,
            avatarUrl: users.avatarUrl,
            level: users.level,

            joinedAt: regionMembers.createdAt,
            role: regionMembers.role, // Return role
        })
            .from(regionMembers)
            .innerJoin(users, eq(regionMembers.userId, users.id))
            .where(eq(regionMembers.regionId, id))
            .orderBy(desc(regionMembers.createdAt));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// GET region activities
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
            user: {
                id: users.id,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl,
            }
        })
            .from(activities)
            .leftJoin(users, eq(activities.userId, users.id))
            .where(eq(activities.regionId, id))
            .orderBy(desc(activities.createdAt));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// POST join region
router.post('/:id/join', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        // Check if already member
        const existing = await db.select().from(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, userId)))
            .limit(1);

        if (existing.length > 0) {
            res.status(400).json({ error: 'Already a member' });
            return;
        }

        await db.insert(regionMembers).values({
            regionId: id,
            userId: userId,
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join region' });
    }
});

// DELETE leave region
router.delete('/:id/leave', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;


        // Check if user is admin of this region
        const member = await db.select().from(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, userId)))
            .limit(1);

        if (member.length > 0 && member[0].role === 'admin') {
            res.status(400).json({ error: 'Admin cannot leave directly. Please demote yourself or transfer ownership first.' });
            return;
        }

        await db.delete(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, userId)));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to leave region' });
    }
});

// GET check membership status
router.get('/:id/membership', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        const existing = await db.select().from(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, userId)))
            .limit(1);

        const membership = existing.length > 0 ? { isMember: true, role: existing[0].role } : { isMember: false, role: null };
        res.json(membership);
    } catch (error) {
        res.status(500).json({ error: 'Failed to check membership' });
    }
});

// POST create region (admin)
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, slug, description, imageUrl, coverUrl } = req.body;
        const result = await db.insert(regions).values({
            name,
            slug,
            description,
            imageUrl,

            status: 'pending', // Default to pending
            socialLinks: JSON.stringify({}),
        }).returning();

        // Make creator an admin automatically
        if (req.user) {
            const userId = req.user.sub || req.user.id;
            await db.insert(regionMembers).values({
                regionId: result[0].id,
                userId: userId,
                role: 'admin'
            });
        }

        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create region' });
    }
});

// PUT update region
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, imageUrl, coverUrl, socialLinks } = req.body;
        const requesterId = req.user ? (req.user.sub || req.user.id) : null;

        // Check permissions
        if (requesterId) {
            const member = await db.select().from(regionMembers)
                .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, requesterId), eq(regionMembers.role, 'admin')))
                .limit(1);
            const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);

            if (member.length === 0 && superAdmin.length === 0) {
                res.status(403).json({ error: 'Unauthorized' });
                return;
            }
        }

        const result = await db.update(regions)
            .set({ name, slug, description, imageUrl, coverUrl, socialLinks: JSON.stringify(socialLinks) })
            .where(eq(regions.id, id))
            .returning();
        if (result.length === 0) {
            res.status(404).json({ error: 'Region not found' });
            return;
        }
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update region' });
    }
});


// DELETE region
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.sub || req.user.id;

        // Check permissions
        const member = await db.select().from(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, requesterId), eq(regionMembers.role, 'admin')))
            .limit(1);
        const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);

        if (member.length === 0 && superAdmin.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        await db.delete(regions).where(eq(regions.id, id));
        res.json({ message: 'Region deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete region' });
    }
});



// POST promote member to admin
router.post('/:id/admins', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const requesterId = req.user.sub || req.user.id;

        // Verify requester is admin of this region
        const requesterMember = await db.select().from(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, requesterId), eq(regionMembers.role, 'admin')))
            .limit(1);

        if (requesterMember.length === 0) {
            // Check if superadmin (bypass) - assuming 'admin' role in users table is superadmin
            const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);
            if (superAdmin.length === 0) {
                res.status(403).json({ error: 'Unauthorized' });
                return;
            }
        }

        await db.update(regionMembers)
            .set({ role: 'admin' })
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, userId)));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to promote member' });
    }
});

// POST demote admin to member
router.post('/:id/demote', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const requesterId = req.user.sub || req.user.id;

        // Verify requester is admin of this region
        const requesterMember = await db.select().from(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, requesterId), eq(regionMembers.role, 'admin')))
            .limit(1);

        if (requesterMember.length === 0) {
            // Check if superadmin
            const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);
            if (superAdmin.length === 0) {
                res.status(403).json({ error: 'Unauthorized' });
                return;
            }
        }

        await db.update(regionMembers)
            .set({ role: 'member' })
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, userId)));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to demote member' });
    }
});

// POST kick member
router.delete('/:id/members/:userId', authenticate, async (req, res) => {
    try {
        const { id, userId } = req.params;
        const requesterId = req.user.sub || req.user.id;

        // Verify requester is admin
        const requesterMember = await db.select().from(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, requesterId), eq(regionMembers.role, 'admin')))
            .limit(1);

        if (requesterMember.length === 0) {
            const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);
            if (superAdmin.length === 0) {
                res.status(403).json({ error: 'Unauthorized' });
                return;
            }
        }

        await db.delete(regionMembers)
            .where(and(eq(regionMembers.regionId, id), eq(regionMembers.userId, userId)));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to kick member' });
    }
});

// POST approve region (Superadmin)
router.post('/:id/approve', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.sub || req.user.id;

        // Verify superadmin
        const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);
        if (superAdmin.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        await db.update(regions).set({ status: 'active' }).where(eq(regions.id, id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve region' });
    }
});

// POST reject region (Superadmin)
router.post('/:id/reject', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.sub || req.user.id;

        const superAdmin = await db.select().from(users).where(and(eq(users.id, requesterId), eq(users.role, 'admin'))).limit(1);
        if (superAdmin.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        await db.update(regions).set({ status: 'rejected' }).where(eq(regions.id, id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject region' });
    }
});
export default router;

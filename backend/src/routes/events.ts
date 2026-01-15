import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { events, eventParticipants, users, regions } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
import { eq, and, desc, sql } from 'drizzle-orm';
import { awardExp } from '../utils/exp';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all events
router.get('/', async (req: Request, res: Response) => {
    try {
        const { regionId } = req.query;
        let query = db.select().from(events);

        if (regionId) {
            // @ts-ignore
            query.where(eq(events.regionId, regionId));
        }

        const result = await query.orderBy(desc(events.createdAt));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET joined events
router.get('/joined', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const joinedEvents = await db.select({
            id: events.id,
            title: events.title,
            description: events.description,
            location: events.location,
            dateStart: events.dateStart,
            dateEnd: events.dateEnd,
            imageUrl: events.imageUrl,
            price: events.price,
            maxParticipants: events.maxParticipants,
            organizerId: events.organizerId,
            createdAt: events.createdAt,
            updatedAt: events.updatedAt,
            organizer: {
                id: users.id,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl,
            }
        })
            .from(eventParticipants)
            .innerJoin(events, eq(eventParticipants.eventId, events.id))
            .leftJoin(users, eq(events.organizerId, users.id))
            .where(eq(eventParticipants.userId, userId))
            .orderBy(desc(events.dateStart));

        res.json(joinedEvents);
    } catch (error) {
        console.error("Error fetching joined events:", error);
        res.status(500).json({ error: 'Failed to fetch joined events' });
    }
});

// GET user created events
router.get('/created', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const result = await db.select().from(events)
            .where(eq(events.organizerId, userId))
            .orderBy(desc(events.createdAt));

        res.json(result);
    } catch (error) {
        console.error("Error fetching created events:", error);
        res.status(500).json({ error: 'Failed to fetch created events' });
    }
});

// GET single event with organizer info
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await db.select({
            id: events.id,
            title: events.title,
            description: events.description,
            location: events.location,
            dateStart: events.dateStart,
            dateEnd: events.dateEnd,
            imageUrl: events.imageUrl,
            price: events.price,
            maxParticipants: events.maxParticipants,
            organizerId: events.organizerId,
            regionId: events.regionId,
            createdAt: events.createdAt,
            updatedAt: events.updatedAt,
            organizer: {
                id: users.id,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl,
                level: users.level,
                exp: users.exp,
            },
            region: {
                id: regions.id,
                name: regions.name,
                slug: regions.slug,
                imageUrl: regions.imageUrl,
            }
        })
            .from(events)
            .leftJoin(users, eq(events.organizerId, users.id))
            .leftJoin(regions, eq(events.regionId, regions.id))
            .where(eq(events.id, id))
            .limit(1);

        if (result.length === 0) {
            res.status(404).json({ error: 'Event not found' });
            return
        }
        // Fetch participants with seat count
        const participantsList = await db.select({
            id: users.id,
            fullName: users.fullName,
            avatarUrl: users.avatarUrl,
            level: users.level,
            exp: users.exp,
            seatCount: eventParticipants.seatCount,
        })
            .from(eventParticipants)
            .innerJoin(users, eq(eventParticipants.userId, users.id))
            .where(eq(eventParticipants.eventId, id));

        res.json({
            ...result[0],
            participants: participantsList
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// POST create event
router.post('/', authenticate, upload.single('image'), async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const { title, description, location, date_start, date_end, price, max_participants, imageUrl, regionId } = req.body;
        const imageFile = req.file;

        let image_url = imageUrl || null; // Accept imageUrl from JSON body (client-side upload)
        if (imageFile) {
            image_url = await uploadImage(imageFile, 'events');
        }

        const newEvent = await db.insert(events).values({
            title,
            description,
            location,
            dateStart: date_start,
            dateEnd: date_end || null,
            price: price || '0',
            maxParticipants: max_participants ? parseInt(max_participants) : null,
            imageUrl: image_url,
            regionId: regionId || null,
            organizerId: userId,
        }).returning();

        res.status(201).json(newEvent[0]);

    } catch (error: any) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// PUT update event
router.put('/:id', authenticate, upload.single('image'), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        const { title, description, location, date_start, date_end, price, max_participants, imageUrl, regionId } = req.body;
        const imageFile = req.file;

        // Verify ownership
        const existingEvent = await db.select().from(events).where(eq(events.id, id)).limit(1);
        if (existingEvent.length === 0) {
            res.status(404).json({ error: 'Event not found' });
            return
        }
        if (existingEvent[0].organizerId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return
        }

        let image_url = existingEvent[0].imageUrl;

        // Handle new image from file upload
        if (imageFile) {
            if (existingEvent[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingEvent[0].imageUrl);
                if (publicId) await deleteImage(publicId);
            }
            image_url = await uploadImage(imageFile, 'events');
        }
        // Handle new image from client-side upload (imageUrl from body)
        else if (imageUrl) {
            if (existingEvent[0].imageUrl && existingEvent[0].imageUrl !== imageUrl) {
                const publicId = getPublicIdFromUrl(existingEvent[0].imageUrl);
                if (publicId) await deleteImage(publicId);
            }
            image_url = imageUrl;
        }

        const updatedEvent = await db.update(events).set({
            title,
            description,
            location,
            dateStart: date_start,
            dateEnd: date_end || null,
            price: price || '0',
            maxParticipants: max_participants ? parseInt(max_participants) : null,
            imageUrl: image_url,
            regionId: regionId ?? existingEvent[0].regionId,
        }).where(eq(events.id, id)).returning();

        res.json(updatedEvent[0]);

    } catch (error: any) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// DELETE event
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        const existingEvent = await db.select().from(events).where(eq(events.id, id)).limit(1);
        if (existingEvent.length === 0) {
            res.status(404).json({ error: 'Event not found' });
            return
        }
        if (existingEvent[0].organizerId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return
        }

        await db.delete(events).where(eq(events.id, id));

        // Background image deletion - In Serverless (Vercel), we MUST await this
        try {
            console.log("Cleanup: Event deleted, cleaning up images...");
            if (existingEvent[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingEvent[0].imageUrl);
                if (publicId) {
                    console.log("Cleanup: Queuing deletion for cover image:", publicId);
                    await deleteImage(publicId);
                }
            }
        } catch (err) {
            console.error("Image deletion cleanup failed during event deletion:", err);
        }

        res.json({ message: 'Event deleted successfully' });

    } catch (error: any) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// POST join event
router.post('/:id/join', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;
        const { seatCount = 1 } = req.body;
        const seats = parseInt(seatCount);

        if (seats < 1) {
            res.status(400).json({ error: "Jumlah seat minimal 1" });
            return;
        }

        // Check if already joined
        const existing = await db.select().from(eventParticipants)
            .where(and(eq(eventParticipants.eventId, id), eq(eventParticipants.userId, userId)))
            .limit(1);

        if (existing.length > 0) {
            res.status(400).json({ error: "Already joined" });
            return;
        }

        // Check capacity
        const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
        if (event.length === 0) {
            res.status(404).json({ error: "Event not found" });
            return;
        }

        if (event[0].maxParticipants) {
            const currentStats = await db.select({
                total: sql<number>`sum(${eventParticipants.seatCount})`
            })
                .from(eventParticipants)
                .where(eq(eventParticipants.eventId, id));

            const currentTotal = Number(currentStats[0]?.total || 0);

            if (currentTotal + seats > event[0].maxParticipants) {
                res.status(400).json({
                    error: "Not enough seats",
                    message: `Sisa kuota tidak cukup. Tersisa: ${event[0].maxParticipants - currentTotal}`
                });
                return;
            }
        }

        await db.insert(eventParticipants).values({
            eventId: id,
            userId: userId,
            seatCount: seats,
        });

        // Award EXP for joining event
        await awardExp(userId, 1);

        res.json({ success: true });

    } catch (error: any) {
        console.error("Error joining event:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// DELETE leave event
router.delete('/:id/leave', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        await db.delete(eventParticipants)
            .where(and(eq(eventParticipants.eventId, id), eq(eventParticipants.userId, userId)));

        res.json({ success: true });

    } catch (error: any) {
        console.error("Error leaving event:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;

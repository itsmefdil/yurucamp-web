import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { events, eventParticipants } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
import { eq, and, desc } from 'drizzle-orm';
import { awardExp } from '../utils/exp';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all events
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await db.select().from(events).orderBy(desc(events.createdAt));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET single event
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await db.select().from(events).where(eq(events.id, id)).limit(1);

        if (result.length === 0) {
            res.status(404).json({ error: 'Event not found' });
            return
        }
        res.json(result[0]);
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

        const { title, description, location, date_start, date_end, price, max_participants } = req.body;
        const imageFile = req.file;

        let image_url = null;
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

        const { title, description, location, date_start, date_end, price, max_participants } = req.body;
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
        if (imageFile) {
            if (existingEvent[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingEvent[0].imageUrl);
                if (publicId) await deleteImage(publicId);
            }
            image_url = await uploadImage(imageFile, 'events');
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

        if (existingEvent[0].imageUrl) {
            const publicId = getPublicIdFromUrl(existingEvent[0].imageUrl);
            if (publicId) await deleteImage(publicId);
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

        // Check if already joined
        const existing = await db.select().from(eventParticipants)
            .where(and(eq(eventParticipants.eventId, id), eq(eventParticipants.userId, userId)))
            .limit(1);

        if (existing.length > 0) {
            res.status(400).json({ error: "Already joined" });
            return;
        }

        await db.insert(eventParticipants).values({
            eventId: id,
            userId: userId,
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

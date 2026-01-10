import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { activities, users } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all activities
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await db.select({
            id: activities.id,
            title: activities.title,
            description: activities.description,
            categoryId: activities.categoryId,
            date: activities.date,
            location: activities.location,
            imageUrl: activities.imageUrl,
            additionalImages: activities.additionalImages,
            userId: activities.userId,
            createdAt: activities.createdAt,
            user: {
                id: users.id,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl,
            }
        })
            .from(activities)
            .leftJoin(users, eq(activities.userId, users.id))
            .orderBy(desc(activities.createdAt));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// GET single activity by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await db.select().from(activities).where(eq(activities.id, id)).limit(1);

        if (result.length === 0) {
            res.status(404).json({ error: 'Activity not found' });
            return;
        }

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// POST create activity
router.post('/', authenticate, upload.none(), async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const { title, description, categoryId, date, location, imageUrl, additionalImages } = req.body;

        const newActivity = await db.insert(activities).values({
            title,
            description,
            categoryId,
            date,
            location,
            imageUrl: imageUrl || null,
            additionalImages: additionalImages || [],
            userId: userId,
        }).returning();

        res.status(201).json(newActivity[0]);

    } catch (error: any) {
        console.error("Error creating activity:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// PUT update activity
router.put('/:id', authenticate, upload.none(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        const { title, description, categoryId, date, location, keptImages, additionalImages, imageUrl } = req.body;

        // Verify ownership
        const existingActivity = await db.select().from(activities).where(eq(activities.id, id)).limit(1);
        if (existingActivity.length === 0) {
            res.status(404).json({ error: 'Activity not found' });
            return;
        }
        if (existingActivity[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        // Combine kept images with newly uploaded images
        // keptImages and additionalImages are arrays of strings (URLs) sent from client
        const keptImagesList = Array.isArray(keptImages) ? keptImages : (keptImages ? [keptImages] : []);
        const additionalImagesList = Array.isArray(additionalImages) ? additionalImages : (additionalImages ? [additionalImages] : []);

        const allAdditionalImages = [...keptImagesList, ...additionalImagesList];

        // Identify removed additional images
        const previousAdditionalImages = existingActivity[0].additionalImages || [];
        const removedAdditionalImages = previousAdditionalImages.filter((img: string) => !keptImagesList.includes(img));

        console.log("Cleanup: Identifying removals for Cloudinary:", removedAdditionalImages);

        // Collect deletion promises
        const deletionPromises: Promise<any>[] = [];

        // Delete removed additional images
        for (const url of removedAdditionalImages) {
            // CRITICAL: Don't delete if it's currently being set as the NEW cover
            if (url === imageUrl) continue;

            const publicId = getPublicIdFromUrl(url);
            if (publicId) {
                console.log("Cleanup: Queuing deletion for gallery image:", publicId);
                deletionPromises.push(deleteImage(publicId).catch(err => console.error("Error deleting gallery image:", publicId, err)));
            }
        }

        // Delete old cover ONLY if it was actually replaced by a NEW one 
        // AND it's not being moved to the additional images gallery
        const oldCover = existingActivity[0].imageUrl;
        const isCoverReplaced = imageUrl && imageUrl !== oldCover;

        if (oldCover && isCoverReplaced && !allAdditionalImages.includes(oldCover)) {
            const publicId = getPublicIdFromUrl(oldCover);
            if (publicId) {
                console.log("Cleanup: Queuing deletion for old cover image:", publicId);
                deletionPromises.push(deleteImage(publicId).catch(err => console.error("Error deleting old cover:", publicId, err)));
            }
        }

        // CRITICAL for Vercel: We must await all external calls before finishing the request
        if (deletionPromises.length > 0) {
            await Promise.all(deletionPromises);
        }

        const updatedActivity = await db.update(activities).set({
            title,
            description,
            categoryId,
            date,
            location,
            imageUrl: imageUrl || existingActivity[0].imageUrl, // Use new URL or fallback (though client should send current if no change)
            additionalImages: allAdditionalImages,
        }).where(eq(activities.id, id)).returning();

        res.json(updatedActivity[0]);

    } catch (error: any) {
        console.error("Error updating activity:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// DELETE activity
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        // Verify ownership
        const existingActivity = await db.select().from(activities).where(eq(activities.id, id)).limit(1);
        if (existingActivity.length === 0) {
            res.status(404).json({ error: 'Activity not found' });
            return
        }
        if (existingActivity[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return
        }

        await db.delete(activities).where(eq(activities.id, id));

        // Background image deletion - In Serverless (Vercel), we MUST await this
        try {
            console.log("Cleanup: Activity deleted, cleaning up images...");
            const deletionPromises: Promise<any>[] = [];

            if (existingActivity[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingActivity[0].imageUrl);
                if (publicId) {
                    console.log("Cleanup: Queuing deletion for cover image:", publicId);
                    deletionPromises.push(deleteImage(publicId));
                }
            }
            if (existingActivity[0].additionalImages) {
                console.log(`Cleanup: Queuing deletion for ${existingActivity[0].additionalImages.length} additional images...`);
                for (const url of existingActivity[0].additionalImages!) {
                    const publicId = getPublicIdFromUrl(url);
                    if (publicId) {
                        console.log("Cleanup: Queuing deletion for gallery image:", publicId);
                        deletionPromises.push(deleteImage(publicId));
                    }
                }
            }

            if (deletionPromises.length > 0) {
                await Promise.all(deletionPromises);
            }
        } catch (err) {
            console.error("Image deletion cleanup failed during activity deletion:", err);
        }

        res.json({ message: 'Activity deleted successfully' });

    } catch (error: any) {
        console.error("Error deleting activity:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;

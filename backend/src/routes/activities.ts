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

        // Find images that were removed (exist in database but not in kept list)
        // Note: Client handles upload, but deletion of old images is still good practice if we can track them.
        // The keptImagesList contains URLs that the user wants to keep.
        // We should compare existingActivity[0].additionalImages with keptImagesList.

        const previousAdditionalImages = existingActivity[0].additionalImages || [];
        const removedAdditionalImages = previousAdditionalImages.filter((img: string) => !keptImagesList.includes(img));

        // Also check if cover image changed and needs deletion (if old cover is not used as cover anymore). 
        // NOTE: The client logic sends 'imageUrl' as the new cover URL.
        // If existingActivity[0].imageUrl is different from new imageUrl, AND it's not in additionalImages either, we could delete it.
        // But simplify for now: just delete removed additional images.
        // And if cover changed, delete old cover if it's not reused? For now let's just delete removed additional images.

        // Delete removed images from Cloudinary
        for (const url of removedAdditionalImages) {
            const publicId = getPublicIdFromUrl(url);
            if (publicId) {
                // Background delete
                deleteImage(publicId).catch(console.error);
            }
        }

        // If cover image is updated, we might want to delete the old one if it's strictly replaced.
        // But since we don't know if the old cover was moved to additional, or just gone, let's be careful.
        // If the old cover URL is NOT in the new 'imageUrl' AND NOT in 'allAdditionalImages', then it's truly gone.
        const oldCover = existingActivity[0].imageUrl;
        if (oldCover && oldCover !== imageUrl && !allAdditionalImages.includes(oldCover)) {
            const publicId = getPublicIdFromUrl(oldCover);
            if (publicId) deleteImage(publicId).catch(console.error);
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

        // Background image deletion (fire and forget)
        (async () => {
            if (existingActivity[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingActivity[0].imageUrl);
                if (publicId) await deleteImage(publicId);
            }
            if (existingActivity[0].additionalImages) {
                for (const url of existingActivity[0].additionalImages!) {
                    const publicId = getPublicIdFromUrl(url);
                    if (publicId) await deleteImage(publicId);
                }
            }
        })().catch(err => console.error("Background image deletion failed", err));

        res.json({ message: 'Activity deleted successfully' });

    } catch (error: any) {
        console.error("Error deleting activity:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;

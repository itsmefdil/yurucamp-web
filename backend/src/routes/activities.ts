import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { activities } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
import { eq, and } from 'drizzle-orm';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all activities
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await db.select().from(activities).orderBy(activities.createdAt);
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
router.post('/', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 10 }]), async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const { title, description, category, date, location } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const imageFile = files['image']?.[0];
        const additionalImageFiles = files['additional_images'] || [];

        let image_url = null;
        const additional_images: string[] = [];

        if (imageFile) {
            const url = await uploadImage(imageFile, 'activities');
            if (url) image_url = url;
        }

        // Parallel upload for additional images
        const uploadPromises = additionalImageFiles.map(file => uploadImage(file, 'activities'));
        const uploadedUrls = await Promise.all(uploadPromises);
        uploadedUrls.forEach(url => {
            if (url) additional_images.push(url);
        });

        const newActivity = await db.insert(activities).values({
            title,
            description,
            category,
            date,
            location,
            imageUrl: image_url,
            additionalImages: additional_images,
            userId: userId,
        }).returning();

        res.status(201).json(newActivity[0]);

    } catch (error: any) {
        console.error("Error creating activity:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// PUT update activity
router.put('/:id', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 10 }]), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        const { title, description, category, date, location, kept_images } = req.body;
        const keptImagesList = Array.isArray(kept_images) ? kept_images : (kept_images ? [kept_images] : []);

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imageFile = files['image']?.[0];
        const additionalImageFiles = files['additional_images'] || [];

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

        let image_url = existingActivity[0].imageUrl;
        let additional_images = [...keptImagesList];

        if (imageFile) {
            const url = await uploadImage(imageFile, 'activities');
            if (url) image_url = url;
        }

        // Parallel upload for additional images
        const uploadPromises = additionalImageFiles.map(file => uploadImage(file, 'activities'));
        const uploadedUrls = await Promise.all(uploadPromises);
        uploadedUrls.forEach(url => {
            if (url) additional_images.push(url);
        });

        const updatedActivity = await db.update(activities).set({
            title,
            description,
            category,
            date,
            location,
            imageUrl: image_url,
            additionalImages: additional_images,
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

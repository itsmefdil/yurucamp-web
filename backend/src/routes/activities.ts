import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { activities, users } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
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
router.post('/', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 10 }]), async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const { title, description, categoryId, date, location } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const imageFile = files?.['image']?.[0];
        const additionalFiles = files?.['additional_images'] || [];

        let image_url = null;
        const additional_images: string[] = [];

        if (imageFile) {
            const url = await uploadImage(imageFile, 'activities');
            if (url) image_url = url;
        }

        // Parallel upload for additional images
        const uploadPromises = additionalFiles.map(file => uploadImage(file, 'activities')); // Used new variable name here
        const uploadedUrls = await Promise.all(uploadPromises);
        uploadedUrls.forEach(url => {
            if (url) additional_images.push(url);
        });

        const newActivity = await db.insert(activities).values({
            title,
            description,
            categoryId,
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

        const { title, description, categoryId, date, location, kept_images } = req.body;

        // Debug: log all received files
        console.log('req.files:', req.files);
        console.log('req.body keys:', Object.keys(req.body));

        // Parse kept_images - it might be a JSON string or already an array
        let keptImagesList: string[] = [];
        if (kept_images) {
            if (typeof kept_images === 'string') {
                try {
                    const parsed = JSON.parse(kept_images);
                    // Flatten in case it's a nested array
                    keptImagesList = Array.isArray(parsed) ? parsed.flat(Infinity).filter((x: unknown): x is string => typeof x === 'string') : [kept_images];
                } catch {
                    keptImagesList = [kept_images];
                }
            } else if (Array.isArray(kept_images)) {
                // Flatten in case it's a nested array
                keptImagesList = kept_images.flat(Infinity).filter((x: unknown): x is string => typeof x === 'string');
            }
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const imageFile = files?.['image']?.[0];
        const additionalFiles = files?.['additional_images'] || [];

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
        const additional_images: string[] = [];

        if (imageFile) {
            const url = await uploadImage(imageFile, 'activities');
            if (url) image_url = url;
        }

        // Parallel upload for additional images
        console.log('Additional files received:', additionalFiles.length, additionalFiles.map((f: Express.Multer.File) => f.originalname));
        const uploadPromises = additionalFiles.map((file: Express.Multer.File) => uploadImage(file, 'activities'));
        const uploadedUrls = await Promise.all(uploadPromises);
        console.log('Uploaded additional URLs:', uploadedUrls);
        uploadedUrls.forEach((url: string | null) => {
            if (url) additional_images.push(url);
        });

        // Combine kept images with newly uploaded images
        const allAdditionalImages = [...keptImagesList, ...additional_images];

        // Find images that were removed (exist in database but not in kept list)
        const existingImages = existingActivity[0].additionalImages || [];
        const removedImages = existingImages.filter((img: string) => !keptImagesList.includes(img));

        // Delete removed images from Cloudinary
        for (const imageUrl of removedImages) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
                console.log('Deleting removed image from Cloudinary:', publicId);
                await deleteImage(publicId);
            }
        }

        const updatedActivity = await db.update(activities).set({
            title,
            description,
            categoryId,
            date,
            location,
            imageUrl: image_url,
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

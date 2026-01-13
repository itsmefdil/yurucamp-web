import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { campAreas } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
import { eq, desc } from 'drizzle-orm';
import { awardExp } from '../utils/exp';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all camp areas
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await db.select().from(campAreas).orderBy(desc(campAreas.createdAt));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch camp areas' });
    }
});

// GET single camp area
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await db.select().from(campAreas).where(eq(campAreas.id, id)).limit(1);

        if (result.length === 0) {
            res.status(404).json({ error: 'Camp area not found' });
            return
        }
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch camp area' });
    }
});

// POST create camp area
router.post('/', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 10 }]), async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const { name, description, location, price, wifi, parking, canteen, tent, info } = req.body;

        // Parse facilities
        const facilities: string[] = [];
        if (wifi === 'on') facilities.push('Wifi');
        if (parking === 'on') facilities.push('Parkir');
        if (canteen === 'on') facilities.push('Kantin');
        if (tent === 'on') facilities.push('Sewa Tenda');
        if (info === 'on') facilities.push('Pusat Info');

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imageFile = files['image']?.[0];
        const additionalImageFiles = files['additional_images'] || [];

        let image_url = null;
        const additional_images: string[] = [];

        if (imageFile) {
            const url = await uploadImage(imageFile, 'camp_areas');
            if (url) image_url = url;
        }

        const uploadPromises = additionalImageFiles.map(file => uploadImage(file, 'camp_areas'));
        const uploadedUrls = await Promise.all(uploadPromises);
        uploadedUrls.forEach(url => {
            if (url) additional_images.push(url);
        });

        const newCampArea = await db.insert(campAreas).values({
            name,
            description,
            location,
            price,
            facilities,
            imageUrl: image_url,
            additionalImages: additional_images,
            userId: userId,
        }).returning();

        // Award EXP for posting camp area
        await awardExp(userId, 1);

        res.status(201).json(newCampArea[0]);

    } catch (error: any) {
        console.error("Error creating camp area:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// PUT update camp area
router.put('/:id', authenticate, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 10 }]), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        const { name, description, location, price, wifi, parking, canteen, tent, info, kept_images } = req.body;

        // Parse facilities
        const facilities: string[] = [];
        if (wifi === 'on' || wifi === 'true') facilities.push('Wifi');
        if (parking === 'on' || parking === 'true') facilities.push('Parkir');
        if (canteen === 'on' || canteen === 'true') facilities.push('Kantin');
        if (tent === 'on' || tent === 'true') facilities.push('Sewa Tenda');
        if (info === 'on' || info === 'true') facilities.push('Pusat Info');

        const keptImagesList = Array.isArray(kept_images) ? kept_images : (kept_images ? [kept_images] : []);

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imageFile = files['image']?.[0];
        const additionalImageFiles = files['additional_images'] || [];

        // Verify ownership
        const existingCampArea = await db.select().from(campAreas).where(eq(campAreas.id, id)).limit(1);
        if (existingCampArea.length === 0) {
            res.status(404).json({ error: 'Camp area not found' });
            return
        }
        if (existingCampArea[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return
        }

        let image_url = existingCampArea[0].imageUrl;
        let additional_images = [...keptImagesList];

        if (imageFile) {
            // Delete old image
            if (existingCampArea[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingCampArea[0].imageUrl);
                if (publicId) await deleteImage(publicId);
            }
            image_url = await uploadImage(imageFile, 'camp_areas');
        }

        // Handle removed additional images
        const oldAdditionalImages = existingCampArea[0].additionalImages || [];
        for (const img of oldAdditionalImages) {
            if (!keptImagesList.includes(img)) {
                const publicId = getPublicIdFromUrl(img);
                if (publicId) await deleteImage(publicId);
            }
        }

        const uploadPromises = additionalImageFiles.map(file => uploadImage(file, 'camp_areas'));
        const uploadedUrls = await Promise.all(uploadPromises);
        uploadedUrls.forEach(url => {
            if (url) additional_images.push(url);
        });

        const updatedCampArea = await db.update(campAreas).set({
            name,
            description,
            location,
            price,
            facilities,
            imageUrl: image_url,
            additionalImages: additional_images,
        }).where(eq(campAreas.id, id)).returning();

        res.json(updatedCampArea[0]);

    } catch (error: any) {
        console.error("Error updating camp area:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// DELETE camp area
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        // Verify ownership
        const existingCampArea = await db.select().from(campAreas).where(eq(campAreas.id, id)).limit(1);
        if (existingCampArea.length === 0) {
            res.status(404).json({ error: 'Camp area not found' });
            return
        }
        if (existingCampArea[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return
        }

        await db.delete(campAreas).where(eq(campAreas.id, id));

        // Background delete images
        (async () => {
            if (existingCampArea[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingCampArea[0].imageUrl);
                if (publicId) await deleteImage(publicId);
            }
            if (existingCampArea[0].additionalImages) {
                for (const url of existingCampArea[0].additionalImages!) {
                    const publicId = getPublicIdFromUrl(url);
                    if (publicId) await deleteImage(publicId);
                }
            }
        })().catch(err => console.error("Background deletion error", err));

        res.json({ message: 'Camp area deleted successfully' });

    } catch (error: any) {
        console.error("Error deleting camp area:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;

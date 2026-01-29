import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../db';
import { campAreas, users } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
import { eq, desc } from 'drizzle-orm';
import { awardExp, getLevelName } from '../utils/exp';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all camp areas
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await db.select({
            id: campAreas.id,
            name: campAreas.name,
            description: campAreas.description,
            location: campAreas.location,
            price: campAreas.price,
            imageUrl: campAreas.imageUrl,
            additionalImages: campAreas.additionalImages,
            facilities: campAreas.facilities,
            userId: campAreas.userId,
            createdAt: campAreas.createdAt,
            user: {
                id: users.id,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl,
                level: users.level,
                exp: users.exp,
            }
        })
            .from(campAreas)
            .leftJoin(users, eq(campAreas.userId, users.id))
            .orderBy(desc(campAreas.createdAt));

        // Add levelName to each user
        const enrichedResult = result.map(campArea => ({
            ...campArea,
            user: campArea.user ? {
                ...campArea.user,
                levelName: getLevelName(campArea.user.level || 1)
            } : null
        }));

        res.json(enrichedResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch camp areas' });
    }
});

// GET single camp area
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await db.select({
            id: campAreas.id,
            name: campAreas.name,
            description: campAreas.description,
            location: campAreas.location,
            price: campAreas.price,
            imageUrl: campAreas.imageUrl,
            additionalImages: campAreas.additionalImages,
            facilities: campAreas.facilities,
            userId: campAreas.userId,
            createdAt: campAreas.createdAt,
            user: {
                id: users.id,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl,
                level: users.level,
                exp: users.exp,
            }
        })
            .from(campAreas)
            .leftJoin(users, eq(campAreas.userId, users.id))
            .where(eq(campAreas.id, id))
            .limit(1);

        if (result.length === 0) {
            res.status(404).json({ error: 'Camp area not found' });
            return
        }

        // Add levelName to user
        const campArea = {
            ...result[0],
            user: result[0].user ? {
                ...result[0].user,
                levelName: getLevelName(result[0].user.level || 1)
            } : null
        };

        res.json(campArea);
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

        const { name, description, location, price, wifi, parking, canteen, tent, info, imageUrl, additionalImages } = req.body;

        // Parse facilities (support both 'on' and boolean true)
        const facilities: string[] = [];
        if (wifi === 'on' || wifi === true || wifi === 'true') facilities.push('Wifi');
        if (parking === 'on' || parking === true || parking === 'true') facilities.push('Parkir');
        if (canteen === 'on' || canteen === true || canteen === 'true') facilities.push('Kantin');
        if (tent === 'on' || tent === true || tent === 'true') facilities.push('Sewa Tenda');
        if (info === 'on' || info === true || info === 'true') facilities.push('Pusat Info');

        let image_url = null;
        let additional_images: string[] = [];

        // Check if client-side uploaded URLs are provided (JSON mode)
        if (imageUrl) {
            image_url = imageUrl;
            additional_images = Array.isArray(additionalImages) ? additionalImages : [];
        } else {
            // Server-side file upload mode
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const imageFile = files?.['image']?.[0];
            const additionalImageFiles = files?.['additional_images'] || [];

            if (imageFile) {
                const url = await uploadImage(imageFile, 'camp_areas');
                if (url) image_url = url;
            }

            const uploadPromises = additionalImageFiles.map(file => uploadImage(file, 'camp_areas'));
            const uploadedUrls = await Promise.all(uploadPromises);
            uploadedUrls.forEach(url => {
                if (url) additional_images.push(url);
            });
        }

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

        const { name, description, location, price, wifi, parking, canteen, tent, info, kept_images, keptImages, imageUrl, additionalImages } = req.body;

        // Parse facilities (support both 'on', 'true' and boolean true)
        const facilities: string[] = [];
        if (wifi === 'on' || wifi === true || wifi === 'true') facilities.push('Wifi');
        if (parking === 'on' || parking === true || parking === 'true') facilities.push('Parkir');
        if (canteen === 'on' || canteen === true || canteen === 'true') facilities.push('Kantin');
        if (tent === 'on' || tent === true || tent === 'true') facilities.push('Sewa Tenda');
        if (info === 'on' || info === true || info === 'true') facilities.push('Pusat Info');

        // Support both kept_images (form-data) and keptImages (JSON)
        const keptImagesInput = keptImages || kept_images;
        const keptImagesList = Array.isArray(keptImagesInput) ? keptImagesInput : (keptImagesInput ? [keptImagesInput] : []);

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

        // Check if client-side uploaded URL is provided (JSON mode)
        if (imageUrl) {
            // Delete old image if new one is provided
            if (existingCampArea[0].imageUrl && existingCampArea[0].imageUrl !== imageUrl) {
                const publicId = getPublicIdFromUrl(existingCampArea[0].imageUrl);
                if (publicId) await deleteImage(publicId);
            }
            image_url = imageUrl;
        } else {
            // Check for server-side file upload for cover image
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const imageFile = files?.['image']?.[0];

            if (imageFile) {
                // Delete old image
                if (existingCampArea[0].imageUrl) {
                    const publicId = getPublicIdFromUrl(existingCampArea[0].imageUrl);
                    if (publicId) await deleteImage(publicId);
                }
                image_url = await uploadImage(imageFile, 'camp_areas');
            }
        }

        // Handle additional images
        // 1. Add new URLs from client-side upload (JSON body)
        if (additionalImages && Array.isArray(additionalImages)) {
            additional_images.push(...additionalImages);
        }

        // 2. Add new URLs from server-side upload (Multipart)
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const additionalImageFiles = files?.['additional_images'] || [];

        if (additionalImageFiles.length > 0) {
            const uploadPromises = additionalImageFiles.map(file => uploadImage(file, 'camp_areas'));
            const uploadedUrls = await Promise.all(uploadPromises);
            uploadedUrls.forEach(url => {
                if (url) additional_images.push(url);
            });
        }

        // Handle removed additional images
        const oldAdditionalImages = existingCampArea[0].additionalImages || [];
        for (const img of oldAdditionalImages) {
            if (!keptImagesList.includes(img)) {
                const publicId = getPublicIdFromUrl(img);
                if (publicId) await deleteImage(publicId);
            }
        }

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

        // Background image deletion - In Serverless (Vercel), we MUST await this
        try {
            console.log("Cleanup: Camp Area deleted, cleaning up images...");
            const deletionPromises: Promise<any>[] = [];

            if (existingCampArea[0].imageUrl) {
                const publicId = getPublicIdFromUrl(existingCampArea[0].imageUrl);
                if (publicId) {
                    console.log("Cleanup: Queuing deletion for cover image:", publicId);
                    deletionPromises.push(deleteImage(publicId));
                }
            }
            if (existingCampArea[0].additionalImages) {
                console.log(`Cleanup: Queuing deletion for ${existingCampArea[0].additionalImages.length} additional images...`);
                for (const url of existingCampArea[0].additionalImages!) {
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
            console.error("Image deletion cleanup failed during camp area deletion:", err);
        }

        res.json({ message: 'Camp area deleted successfully' });

    } catch (error: any) {
        console.error("Error deleting camp area:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { categories } from '../db/schema';

const router = Router();

// GET all categories
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await db.select().from(categories).orderBy(categories.name);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;

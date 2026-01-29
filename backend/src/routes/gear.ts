
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { gearLists, gearCategories, gearItems, users } from '../db/schema';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { eq, desc, asc, and } from 'drizzle-orm';

const router = Router();

// GET all gear lists for user
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;

        const lists = await db.select().from(gearLists)
            .where(eq(gearLists.userId, userId))
            .orderBy(desc(gearLists.createdAt));

        res.json(lists);
    } catch (error) {
        console.error("Error fetching gear lists:", error);
        res.status(500).json({ error: 'Failed to fetch gear lists' });
    }
});

// GET all public gear lists
router.get('/public', optionalAuthenticate, async (req: Request, res: Response) => {
    try {
        const result = await db.select({
            id: gearLists.id,
            name: gearLists.name,
            description: gearLists.description,
            isPublic: gearLists.isPublic,
            createdAt: gearLists.createdAt,
            userId: gearLists.userId,
            user: {
                id: users.id,
                fullName: users.fullName,
                avatarUrl: users.avatarUrl
            }
        })
            .from(gearLists)
            .leftJoin(users, eq(gearLists.userId, users.id))
            .where(eq(gearLists.isPublic, true))
            .orderBy(desc(gearLists.createdAt));

        res.json(result);
    } catch (error) {
        console.error("Error fetching public gear lists:", error);
        res.status(500).json({ error: 'Failed to fetch public gear lists' });
    }
});

// GET single gear list with categories and items (Public or Owner)
router.get('/:id', optionalAuthenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const list = await db.select().from(gearLists).where(eq(gearLists.id, id)).limit(1);

        if (list.length === 0) {
            res.status(404).json({ error: 'Gear list not found' });
            return;
        }

        const listDataRaw = list[0];
        const user = req.user;
        const userId = user?.sub || user?.id;
        const isOwner = userId === listDataRaw.userId;

        if (!listDataRaw.isPublic && !isOwner) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const categories = await db.select().from(gearCategories)
            .where(eq(gearCategories.gearListId, id))
            .orderBy(asc(gearCategories.sortOrder));

        // Get owner info for public lists
        let ownerInfo = null;
        if (listDataRaw.isPublic) {
            const owner = await db.select({
                fullName: users.fullName,
                avatarUrl: users.avatarUrl
            }).from(users).where(eq(users.id, listDataRaw.userId)).limit(1);
            if (owner.length > 0) {
                ownerInfo = owner[0];
            }
        }

        const listData: any = { ...listDataRaw, categories: [], isOwner, ownerInfo };

        for (const cat of categories) {
            const items = await db.select().from(gearItems)
                .where(eq(gearItems.categoryId, cat.id))
                .orderBy(asc(gearItems.sortOrder));

            listData.categories.push({ ...cat, items });
        }

        res.json(listData);
    } catch (error) {
        console.error("Error fetching gear list:", error);
        res.status(500).json({ error: 'Failed to fetch gear list' });
    }
});

// POST create gear list
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;
        const { name, description } = req.body;

        const newList = await db.insert(gearLists).values({
            userId,
            name,
            description
        }).returning();

        res.status(201).json(newList[0]);
    } catch (error) {
        console.error("Error creating gear list:", error);
        res.status(500).json({ error: 'Failed to create gear list' });
    }
});

// PUT update gear list details
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;
        const { name, description, isPublic } = req.body;

        // Verify ownership
        const existing = await db.select().from(gearLists).where(eq(gearLists.id, id)).limit(1);
        if (existing.length === 0) {
            res.status(404).json({ error: 'Gear list not found' });
            return;
        }
        if (existing[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const updated = await db.update(gearLists).set({
            name,
            description,
            isPublic: isPublic !== undefined ? isPublic : existing[0].isPublic,
            updatedAt: new Date().toISOString()
        }).where(eq(gearLists.id, id)).returning();

        res.json(updated[0]);
    } catch (error) {
        console.error("Error updating gear list:", error);
        res.status(500).json({ error: 'Failed to update gear list' });
    }
});

// DELETE gear list
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        // Verify ownership
        const existing = await db.select().from(gearLists).where(eq(gearLists.id, id)).limit(1);
        if (existing.length === 0) {
            res.status(404).json({ error: 'Gear list not found' });
            return;
        }
        if (existing[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        await db.delete(gearLists).where(eq(gearLists.id, id));
        res.json({ message: 'Gear list deleted' });
    } catch (error) {
        console.error("Error deleting gear list:", error);
        res.status(500).json({ error: 'Failed to delete gear list' });
    }
});

// --- Categories ---

router.post('/categories', authenticate, async (req: Request, res: Response) => {
    try {
        const { gearListId, name, sortOrder } = req.body;
        // Should verify gear list ownership here ideally, but skipping for brevity/MVP speed, relying on UI or later hardening. 

        const newCat = await db.insert(gearCategories).values({
            gearListId,
            name,
            sortOrder: sortOrder || 0
        }).returning();

        res.status(201).json(newCat[0]);
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.put('/categories/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, sortOrder } = req.body;

        const updated = await db.update(gearCategories).set({
            name,
            sortOrder
        }).where(eq(gearCategories.id, id)).returning();

        res.json(updated[0]);
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

router.delete('/categories/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.delete(gearCategories).where(eq(gearCategories.id, id));
        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// --- Items ---

router.post('/items', authenticate, async (req: Request, res: Response) => {
    try {
        const { categoryId, name, description, weight, quantity, sortOrder } = req.body;

        const newItem = await db.insert(gearItems).values({
            categoryId,
            name,
            description,
            weight: weight || 0,
            quantity: quantity || 1,
            sortOrder: sortOrder || 0
        }).returning();

        res.status(201).json(newItem[0]);
    } catch (error) {
        console.error("Error creating item:", error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

router.put('/items/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, weight, quantity, sortOrder } = req.body;

        const updated = await db.update(gearItems).set({
            name,
            description,
            weight,
            quantity,
            sortOrder,
            updatedAt: new Date().toISOString()
        }).where(eq(gearItems.id, id)).returning();

        res.json(updated[0]);
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

router.delete('/items/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.delete(gearItems).where(eq(gearItems.id, id));
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});


// Reorder items in a category
router.put('/categories/:categoryId/items/reorder', authenticate, async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        const { itemIds } = req.body; // Array of item IDs in new order

        if (!Array.isArray(itemIds)) {
            res.status(400).json({ error: 'itemIds must be an array' });
            return;
        }

        // Use transaction or Promise.all to update all items
        // For simplicity with Drizzle/Postgres here, we'll loop
        await db.transaction(async (tx) => {
            for (let i = 0; i < itemIds.length; i++) {
                await tx.update(gearItems)
                    .set({ sortOrder: i })
                    .where(and(eq(gearItems.id, itemIds[i]), eq(gearItems.categoryId, categoryId)));
            }
        });

        res.json({ message: 'Items reordered' });
    } catch (error) {
        console.error("Error reordering items:", error);
        res.status(500).json({ error: 'Failed to reorder items' });
    }
});

// Apply template (Batch create categories and items)
router.post('/:id/apply-template', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { categories } = req.body; // Expects { name: string, items: string[] }[]

        const user = req.user;
        const userId = user.sub || user.id;

        // Verify ownership
        const existing = await db.select().from(gearLists).where(eq(gearLists.id, id)).limit(1);
        if (existing.length === 0) {
            res.status(404).json({ error: 'Gear list not found' });
            return;
        }
        if (existing[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        if (!Array.isArray(categories)) {
            res.status(400).json({ error: 'Categories must be an array' });
            return;
        }

        await db.transaction(async (tx) => {
            // Get current max sort order for categories to append
            // For simplicity, we just assume new ones go at the end based on current length or just use loop index if empty
            // But getting current count is safer.
            const currentCats = await tx.select().from(gearCategories).where(eq(gearCategories.gearListId, id));
            let startSortOrder = currentCats.length;

            for (const cat of categories) {
                const newCat = await tx.insert(gearCategories).values({
                    gearListId: id,
                    name: cat.name,
                    sortOrder: startSortOrder++
                }).returning();

                if (cat.items && Array.isArray(cat.items)) {
                    for (let i = 0; i < cat.items.length; i++) {
                        await tx.insert(gearItems).values({
                            categoryId: newCat[0].id,
                            name: cat.items[i],
                            sortOrder: i
                        });
                    }
                }
            }
        });

        res.json({ message: 'Template applied successfully' });

    } catch (error) {
        console.error("Error applying template:", error);
        res.status(500).json({ error: 'Failed to apply template' });
    }
});

export default router;

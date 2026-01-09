import { Router, Request, Response } from 'express';
import { db } from '../db';
import { activityLikes, activityComments, users } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

// GET interactions for a video (or activity)
router.get('/video/:videoId', async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        // Optionally get user from token if present (soft auth)
        // Express middleware usually is all-or-nothing, but we check header manually here
        // or we could split this into public endpoint

        // For simplicity, just PUBLIC fetch
        const comments = await db.select({
            id: activityComments.id,
            content: activityComments.content,
            createdAt: activityComments.createdAt,
            userId: activityComments.userId,
            user: {
                fullName: users.fullName,
                avatarUrl: users.avatarUrl
            }
        })
            .from(activityComments)
            .leftJoin(users, eq(activityComments.userId, users.id))
            .where(eq(activityComments.videoId, videoId))
            .orderBy(desc(activityComments.createdAt));

        const likes = await db.select({ count: sql<number>`count(*)` })
            .from(activityLikes)
            .where(eq(activityLikes.videoId, videoId));

        res.json({
            comments,
            likeCount: likes[0]?.count || 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch interactions' });
    }
});

// POST toggle like
router.post('/like', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;
        const { activityId, videoId } = req.body;

        if (!activityId && !videoId) {
            res.status(400).json({ error: 'Either activityId or videoId is required' });
            return
        }

        let condition;
        if (activityId) condition = and(eq(activityLikes.userId, userId), eq(activityLikes.activityId, activityId));
        else condition = and(eq(activityLikes.userId, userId), eq(activityLikes.videoId, videoId));

        const existing = await db.select().from(activityLikes).where(condition).limit(1);

        if (existing.length > 0) {
            // Unlike
            await db.delete(activityLikes).where(eq(activityLikes.id, existing[0].id));
            res.json({ liked: false });
        } else {
            // Like
            await db.insert(activityLikes).values({
                userId,
                activityId: activityId || null,
                videoId: videoId || null,
            });
            res.json({ liked: true });
        }

    } catch (error: any) {
        console.error("Error toggling like:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// POST add comment
router.post('/comment', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub || user.id;
        const { activityId, videoId, content } = req.body;

        if (!content || !content.trim()) {
            res.status(400).json({ error: 'Content is required' });
            return
        }

        const newComment = await db.insert(activityComments).values({
            userId,
            activityId: activityId || null,
            videoId: videoId || null,
            content: content.trim(),
        }).returning();

        res.status(201).json(newComment[0]);

    } catch (error: any) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// DELETE comment
router.delete('/comment/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const userId = user.sub || user.id;

        const comment = await db.select().from(activityComments).where(eq(activityComments.id, id)).limit(1);
        if (comment.length === 0) {
            res.status(404).json({ error: 'Comment not found' });
            return
        }
        if (comment[0].userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return
        }

        await db.delete(activityComments).where(eq(activityComments.id, id));
        res.json({ success: true });

    } catch (error: any) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;

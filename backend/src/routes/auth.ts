import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '../lib/cloudinary';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Passport Configuration
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
} else {
    console.log("🔑 Google OAuth Configuration:");
    console.log(`   - Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...`);
    console.log(`   - Client Secret: ${process.env.GOOGLE_CLIENT_SECRET.substring(0, 5)}...`);
    console.log(`   - Callback URL: /auth/google/callback`);

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback" // Relative path, might need full URL in prod
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                const googleId = profile.id;
                const avatarUrl = profile.photos?.[0].value;
                const fullName = profile.displayName;

                if (!email) {
                    return done(new Error("No email found from Google"), undefined);
                }

                // Check if user exists by Google ID
                let user = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);

                if (user.length === 0) {
                    // Check by email (if they logged in via email before, link account)
                    const userByEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);

                    if (userByEmail.length > 0) {
                        // Update existing user with Google ID
                        user = await db.update(users)
                            .set({ googleId: googleId, avatarUrl: userByEmail[0].avatarUrl || avatarUrl })
                            .where(eq(users.email, email))
                            .returning();
                    } else {
                        // Create new user
                        user = await db.insert(users).values({
                            email,
                            googleId,
                            fullName,
                            avatarUrl
                        }).returning();
                    }
                }

                return done(null, user[0]);
            } catch (error) {
                return done(error, undefined);
            }
        }));
}

// Routes

// Google Auth Trigger
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
    (req: Request, res: Response) => {
        // Successful authentication
        const user = req.user as any;
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            res.status(500).json({ error: 'Server misconfiguration' });
            return
        }

        // Generate JWT
        // We use standard 'sub' for user id to match Supabase convention a bit, 
        // but it's our logic now.
        const token = jwt.sign({
            sub: user.id,
            email: user.email,
            role: 'authenticated'
        }, secret, { expiresIn: '7d' });

        // Redirect to frontend with token (e.g., via query param or cookie)
        // Adjust FRONTEND_URL as needed
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

// GET current profile
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub; // Our JWT puts id in 'sub'

        const currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (currentUser.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return
        }

        // Add level info
        const { getUserExpInfo } = await import('../utils/exp');
        const expInfo = await getUserExpInfo(userId);

        res.json({
            ...currentUser[0],
            levelName: expInfo.levelName,
            expToNextLevel: expInfo.expToNextLevel
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// PUT update profile
router.put('/profile', authenticate, upload.single('avatar'), async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const userId = user.sub;
        const { fullName, email, bio, phone, avatarUrl: bodyAvatarUrl } = req.body;
        const avatarFile = req.file;

        const currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        // Ensure user owns this profile
        if (currentUser.length === 0) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        let newAvatarUrl = currentUser[0]?.avatarUrl;

        // Handle file upload (server-side)
        if (avatarFile) {
            if (currentUser[0]?.avatarUrl) {
                const publicId = getPublicIdFromUrl(currentUser[0].avatarUrl);
                if (publicId) await deleteImage(publicId);
            }
            newAvatarUrl = await uploadImage(avatarFile, 'avatars');
        }
        // Handle client-side upload (URL provided)
        else if (bodyAvatarUrl) {
            if (currentUser[0]?.avatarUrl && currentUser[0]?.avatarUrl !== bodyAvatarUrl) {
                const publicId = getPublicIdFromUrl(currentUser[0].avatarUrl);
                if (publicId) await deleteImage(publicId);
            }
            newAvatarUrl = bodyAvatarUrl;
        }

        const updateData: any = {
            fullName,
            email,
            bio,
            phone,
            updatedAt: new Date().toISOString(),
        };

        if (newAvatarUrl) {
            updateData.avatarUrl = newAvatarUrl;
        }

        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning();

        res.json(updatedUser[0]);

    } catch (error: any) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

export default router;

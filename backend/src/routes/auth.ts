import rateLimit from 'express-rate-limit';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { users, refreshTokens } from '../db/schema';
import { authenticate } from '../middleware/auth';
import { uploadImage, deleteImage, getPublicIdFromUrl, areImageUrlsAllowed } from '../lib/cloudinary';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// sameSite 'none' + secure required for cross-subdomain AJAX; clearCookie must use the same attributes
const REFRESH_COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'none' as const };

// Limits OAuth starts and token refreshes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Terlalu banyak permintaan. Coba lagi beberapa menit lagi.' },
});
const upload = multer({ storage: multer.memoryStorage() });

// Passport Configuration
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
} else {
    console.log("🔑 Google OAuth Configuration:");
    console.log(`   - Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...`);
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

                // Only accept emails Google has verified
                if ((profile as any)._json?.email_verified === false || profile.emails?.[0]?.verified === false) {
                    return done(new Error("Google email is not verified"), undefined);
                }

                // Accounts are identified by Google ID only (Google is the only sign-in method).
                // We never link to an existing account by email: that would let anyone who
                // controls an account's email address take it over.
                let user = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);

                if (user.length === 0) {
                    // email is UNIQUE, so a different Google account with an already-registered
                    // email fails here and the login is rejected
                    user = await db.insert(users).values({
                        email,
                        googleId,
                        fullName,
                        avatarUrl
                    }).returning();
                }

                return done(null, user[0]);
            } catch (error) {
                return done(error, undefined);
            }
        }));
}

// Routes

// OAuth `state` is bound to the browser with a short-lived cookie (no server sessions here),
// which prevents login CSRF: a callback is only accepted from the browser that started the flow.
const OAUTH_STATE_COOKIE = 'oauthState';
const OAUTH_STATE_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    // The callback is a top-level redirect from Google, which carries 'lax' cookies
    sameSite: 'lax' as const,
    path: '/auth/google',
};
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function frontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
}

function statesMatch(expected: string | undefined, received: unknown): boolean {
    if (!expected || typeof received !== 'string') return false;
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Google Auth Trigger
router.get('/google', authLimiter, (req: Request, res: Response, next: NextFunction) => {
    const state = crypto.randomBytes(32).toString('hex');
    res.cookie(OAUTH_STATE_COOKIE, state, { ...OAUTH_STATE_COOKIE_OPTIONS, maxAge: OAUTH_STATE_TTL_MS });
    passport.authenticate('google', { scope: ['profile', 'email'], session: false, state })(req, res, next);
});

// Google Auth Callback
router.get('/google/callback', authLimiter, (req: Request, res: Response, next: NextFunction) => {
    const failLogin = (reason: string) => {
        res.redirect(`${frontendUrl()}/login?error=${reason}`);
    };

    const expectedState = parseCookies(req.headers.cookie)[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS);
    if (!statesMatch(expectedState, req.query.state)) {
        failLogin('oauth_state');
        return;
    }

    passport.authenticate('google', { session: false }, async (err: unknown, user: any) => {
        if (err || !user) {
            if (err) console.error('Google OAuth error:', err);
            failLogin('oauth');
            return;
        }

        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error('JWT_SECRET is not set');
                failLogin('oauth');
                return;
            }

            const refreshToken = crypto.randomBytes(64).toString('hex');
            const refreshExpiresMs = 30 * 24 * 60 * 60 * 1000; // 30 days

            await db.insert(refreshTokens).values({
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + refreshExpiresMs).toISOString()
            });

            res.cookie('refreshToken', refreshToken, { ...REFRESH_COOKIE_OPTIONS, maxAge: refreshExpiresMs });

            // No access token in the URL (it would end up in history, logs and Referer headers).
            // The frontend exchanges the refresh cookie for an access token via POST /auth/refresh.
            res.redirect(`${frontendUrl()}/auth/callback`);
        } catch (error) {
            console.error('Error completing Google login:', error);
            failLogin('oauth');
        }
    })(req, res, next);
});

// Helper to parse cookie header (simple)
function parseCookies(cookieHeader: string | undefined) {
    const result: Record<string, string> = {};
    if (!cookieHeader) return result;
    const parts = cookieHeader.split(';');
    for (const part of parts) {
        const idx = part.indexOf('=');
        if (idx > -1) {
            const key = part.slice(0, idx).trim();
            const val = part.slice(idx + 1).trim();
            result[key] = decodeURIComponent(val);
        }
    }
    return result;
}

// Refresh access token using refresh token cookie
router.post('/refresh', authLimiter, async (req: Request, res: Response) => {
    try {
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies['refreshToken'];
        if (!token) {
            res.status(401).json({ error: 'No refresh token' });
            return;
        }

        // Atomically claim (delete) the token so two concurrent refreshes can't both succeed with it
        const rows = await db.delete(refreshTokens).where(eq(refreshTokens.token, token)).returning();
        if (rows.length === 0) {
            // Don't clear the cookie here: a concurrent refresh from another tab may have just set a new one
            res.status(401).json({ error: 'Invalid refresh token' });
            return;
        }

        const rt = rows[0];
        if (rt.expiresAt && new Date(rt.expiresAt) < new Date()) {
            // expired (already deleted above)
            res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
            res.status(401).json({ error: 'Refresh token expired' });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ error: 'Server misconfiguration' });
            return;
        }

        const userResult = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
        }).from(users).where(eq(users.id, rt.userId)).limit(1);

        if (userResult.length === 0) {
            res.status(401).json({ error: 'User not found for refresh token' });
            return;
        }
        const user = userResult[0];

        // Issue new access token and rotate refresh token for security
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const refreshExpiresMs = 30 * 24 * 60 * 60 * 1000; // 30 days

        // Used refresh token was already deleted when claimed above
        await db.insert(refreshTokens).values({
            token: newRefreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + refreshExpiresMs).toISOString()
        });

        // Set httpOnly cookie for new refresh token
        // sameSite: 'none' + secure: true required for cross-subdomain AJAX (yc.noma.my.id → yc-be.noma.my.id)
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: refreshExpiresMs
        });

        const accessToken = jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '15m' }
        );
        res.json({ token: accessToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Logout: revoke refresh token and clear cookie
router.post('/logout', async (req: Request, res: Response) => {
    try {
        const cookies = parseCookies(req.headers.cookie);
        const token = cookies['refreshToken'];
        if (token) {
            await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
        }
        res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
        res.json({ message: 'Logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

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
        // Email is intentionally not editable: it comes from Google and is used to link accounts on login
        const { fullName, bio, phone, avatarUrl: bodyAvatarUrl, regionId, facebook, instagram } = req.body;
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
            newAvatarUrl = await uploadImage(avatarFile, 'avatars', userId);
        }
        // Handle client-side upload (URL provided)
        else if (bodyAvatarUrl) {
            if (!areImageUrlsAllowed([bodyAvatarUrl], userId, [currentUser[0]?.avatarUrl])) {
                res.status(400).json({ error: 'Invalid image URL' });
                return;
            }
            if (currentUser[0]?.avatarUrl && currentUser[0]?.avatarUrl !== bodyAvatarUrl) {
                const publicId = getPublicIdFromUrl(currentUser[0].avatarUrl);
                if (publicId) await deleteImage(publicId);
            }
            newAvatarUrl = bodyAvatarUrl;
        }

        const updateData: any = {
            fullName,
            bio,
            phone,
            facebook: facebook || null,
            instagram: instagram || null,
            regionId: regionId || null,
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

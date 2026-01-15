import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET; // Renamed from SUPABASE_JWT_SECRET

    if (!secret) {
        console.error('JWT_SECRET is not set');
        res.status(500).json({ error: 'Internal Server Error' });
        return
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return
    }
};

// Optional authentication - sets req.user if valid token, but doesn't fail if no token
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // No token provided, continue without user
        next();
        return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        // Server config error, but continue without user for public routes
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
    } catch (error) {
        // Invalid token, continue without user (for public access)
    }
    next();
};

export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    // Only apply to GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.set('WWW-Authenticate', 'Basic realm="Restricted API"');
        res.status(401).json({ error: 'Unauthorized: Basic Auth required' });
        return;
    }

    // Check for Bearer token (JWT)
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set');
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        try {
            // Verify JWT. If valid, proceed.
            // We don't necessarily need to set req.user here if the route doesn't use it,
            // but if the route is protected by `authenticate`, that middleware will run later
            // and re-verify (which is fine, just a tiny bit of duplicated work).
            // OR we can set it here to save work? 
            // Better to just verify "Pass" permission.
            jwt.verify(token, secret);
            return next();
        } catch (error) {
            // Invalid JWT - Fail directly? Or fall through?
            // If they sent Bearer, they intended to use JWT. Fail if invalid.
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
            return;
        }
    }

    // Header format: "Basic base64(user:pass)"
    const match = authHeader.match(/^Basic (.+)$/);
    if (!match) {
        res.set('WWW-Authenticate', 'Basic realm="Restricted API"');
        res.status(401).json({ error: 'Unauthorized: Malformed Authorization header' });
        return;
    }

    const encodedCreds = match[1];
    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString();
    const [user, pass] = decodedCreds.split(':');

    const validUser = process.env.BASIC_AUTH_USER;
    const validPass = process.env.BASIC_AUTH_PASSWORD;

    if (!validUser || !validPass) {
        console.error('Basic Auth credentials not set in environment');
        res.status(500).json({ error: 'Internal Server Error: Auth not configured' });
        return;
    }

    if (user === validUser && pass === validPass) {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm="Restricted API"');
        res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
        return;
    }
};

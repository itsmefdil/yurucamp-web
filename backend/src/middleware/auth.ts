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

import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // req.user is populated by 'authenticate' middleware
    const user = req.user;

    if (!user) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        return;
    }

    if (user.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
    }

    next();
};

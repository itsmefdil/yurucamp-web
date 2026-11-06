import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth';
import { userUploadFolder } from '../lib/cloudinary';

const router = Router();

router.get('/hero-images', (req: Request, res: Response) => {
    const specificImages = [
        "https://yurucamp.jp/camping/content/uploads/2024/03/yurucamp_third_visual_new_240314-600x833.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/05/mv2-600x833.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/03/works_visual_2nd.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/03/works_visual_heya.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/03/works_visual_1st.jpg"
    ];

    // Support limit query param
    const count = req.query.count ? parseInt(req.query.count as string) : 5;
    res.json(specificImages.slice(0, count));
});

// Folders the frontend is allowed to upload into. Anything else is rejected so a
// signature can't be used to write into arbitrary locations of the Cloudinary account.
const ALLOWED_UPLOAD_FOLDERS = new Set(['activities', 'events', 'camp_area', 'avatars', 'community']);

// The client fetches one signature per file per upload attempt (up to 11 files x 3 retries
// per form submit), so the limit leaves headroom for legitimate multi-image posts.
// Note: the store is in-memory, so on serverless it is enforced per instance only.
const signatureLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req: Request) => String(req.user?.sub ?? req.user?.id),
    message: { error: 'Terlalu banyak permintaan upload. Coba lagi beberapa menit lagi.' },
});

router.get('/cloudinary-signature', authenticate, signatureLimiter, (req: Request, res: Response) => {
    const subfolder = typeof req.query.folder === 'string' ? req.query.folder : 'activities';
    if (!ALLOWED_UPLOAD_FOLDERS.has(subfolder)) {
        res.status(400).json({ error: 'Invalid upload folder' });
        return;
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    // Scope uploads to the requesting user so the server can later verify ownership of URLs
    const folderPath = userUploadFolder(subfolder, String(req.user.sub || req.user.id));

    const transformation = 'w_800,c_limit,q_auto,f_auto,fl_lossy';

    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folderPath,
        transformation: transformation,
    }, process.env.CLOUDINARY_API_SECRET as string);

    res.json({
        signature,
        timestamp,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder: folderPath,
        transformation: transformation
    });
});

export default router;

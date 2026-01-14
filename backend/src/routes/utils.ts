import { Router, Request, Response } from 'express';

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

import { v2 as cloudinary } from 'cloudinary';

// ... existing code ...

router.get('/cloudinary-signature', (req: Request, res: Response) => {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const subfolder = req.query.folder as string || 'activities';
    console.log(`[Cloudinary] Generating signature for folder: ${subfolder}`);
    const folderPath = process.env.CLOUDINARY_PATH_PREFIX
        ? `${process.env.CLOUDINARY_PATH_PREFIX}/${subfolder}`
        : subfolder;

    const transformation = 'w_800,c_limit,q_auto';

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

import multer from 'multer';
import { HttpError } from '../middleware/errorHandler';

// Images are normally uploaded straight to Cloudinary from the browser; these limits cover the
// legacy multipart routes so a single request can't exhaust server memory (memoryStorage).
export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_UPLOAD_FILES = 11; // camp areas: 1 cover + 10 additional images

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE,
        files: MAX_UPLOAD_FILES,
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new HttpError(400, 'Hanya file gambar yang diperbolehkan'));
        }
    },
});

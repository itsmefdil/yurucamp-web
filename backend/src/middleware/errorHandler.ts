import { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';

/** An error whose message is safe to show to the client. */
export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'HttpError';
    }
}

const MULTER_MESSAGES: Partial<Record<multer.ErrorCode, string>> = {
    LIMIT_FILE_SIZE: 'Ukuran file terlalu besar (maksimal 10 MB)',
    LIMIT_FILE_COUNT: 'Terlalu banyak file',
    LIMIT_UNEXPECTED_FILE: 'Terlalu banyak file atau field file tidak dikenal',
};

export const notFoundHandler: RequestHandler = (_req, res) => {
    res.status(404).json({ error: 'Not Found' });
};

/**
 * Last-resort error handler. Client errors get a safe message; anything else is logged
 * server-side and answered with a generic 500 so internals (SQL, constraint and column
 * names, stack traces) never reach the client.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message });
        return;
    }

    if (err instanceof multer.MulterError) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        res.status(status).json({ error: MULTER_MESSAGES[err.code] ?? 'Upload tidak valid' });
        return;
    }

    // body-parser errors (http-errors): `expose` is true for 4xx and their messages are safe
    const status = typeof err?.status === 'number' ? err.status : typeof err?.statusCode === 'number' ? err.statusCode : 500;
    if (status === 413) {
        res.status(413).json({ error: 'Request terlalu besar' });
        return;
    }
    if (status >= 400 && status < 500 && err?.expose) {
        res.status(status).json({ error: status === 400 && err.type === 'entity.parse.failed' ? 'Invalid JSON' : err.message });
        return;
    }

    console.error(`Unhandled error on ${req.method} ${req.path}:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
};

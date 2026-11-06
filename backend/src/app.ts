import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import activityRouter from './routes/activities';
import campAreasRouter from './routes/campAreas';
import eventsRouter from './routes/events';
import authRouter from './routes/auth';
import interactionsRouter from './routes/interactions';
import utilsRouter from './routes/utils';
import categoriesRouter from './routes/categories';
import gearRouter from './routes/gear';
import adminRouter from './routes/admin';
import sitemapRouter from './routes/sitemap';
import regionsRouter from './routes/regions';
import usersRouter from './routes/users';

import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

// JSON API only: helmet's defaults add standard security headers (nosniff, HSTS, frame denial, ...)
app.use(helmet({
    // yc.noma.my.id and yc-be.noma.my.id are the same site
    crossOriginResourcePolicy: { policy: 'same-site' },
}));

app.use(morgan('dev'));

// Configure CORS - allow credentials for auth cookies
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Request bodies only carry form fields and image URLs (images go straight to Cloudinary)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/sitemap.xml', sitemapRouter);

// Routes
app.use('/activities', activityRouter);
app.use('/camp-areas', campAreasRouter);
app.use('/events', eventsRouter);
app.use('/auth', authRouter);
app.use('/interactions', interactionsRouter);
app.use('/utils', utilsRouter);
app.use('/categories', categoriesRouter);
app.use('/gear', gearRouter);
app.use('/admin', adminRouter);
app.use('/regions', regionsRouter);
app.use('/users', usersRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Yurucamp Backend API' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

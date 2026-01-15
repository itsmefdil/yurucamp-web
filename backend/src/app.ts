import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import activityRouter from './routes/activities';
import campAreasRouter from './routes/campAreas';
import eventsRouter from './routes/events';
import authRouter from './routes/auth';
import interactionsRouter from './routes/interactions';
import utilsRouter from './routes/utils';
import categoriesRouter from './routes/categories';
import gearRouter from './routes/gear';
import sitemapRouter from './routes/sitemap';
import dotenv from 'dotenv';
import { basicAuth } from './middleware/auth';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(morgan('dev'));

// Configure CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(basicAuth);

// Routes
app.use('/activities', activityRouter);
app.use('/camp-areas', campAreasRouter);
app.use('/events', eventsRouter);
app.use('/auth', authRouter);
app.use('/interactions', interactionsRouter);
app.use('/utils', utilsRouter);
app.use('/categories', categoriesRouter);
app.use('/gear', gearRouter);
app.use('/sitemap.xml', sitemapRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Yurucamp Backend API' });
});

export default app;

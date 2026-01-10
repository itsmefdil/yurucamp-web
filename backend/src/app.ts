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
import dotenv from 'dotenv';

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

app.use(express.json());

// Routes
app.use('/activities', activityRouter);
app.use('/camp-areas', campAreasRouter);
app.use('/events', eventsRouter);
app.use('/auth', authRouter);
app.use('/interactions', interactionsRouter);
app.use('/utils', utilsRouter);
app.use('/categories', categoriesRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Yurucamp Backend API' });
});

export default app;

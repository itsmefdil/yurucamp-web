import express from 'express';
import cors from 'cors';
import activityRouter from './routes/activities';
import campAreasRouter from './routes/campAreas';
import eventsRouter from './routes/events';
import authRouter from './routes/auth';
import interactionsRouter from './routes/interactions';
import utilsRouter from './routes/utils';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

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

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Yurucamp Backend API' });
});

export default app;

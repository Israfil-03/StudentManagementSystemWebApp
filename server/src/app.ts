import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-handler';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app: Application = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API routes
app.use('/api', routes);

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Server is healthy' });
});

// Error Handler Middleware
app.use(errorHandler);

export default app;

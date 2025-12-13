import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-handler';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app: Application = express();

// Parse allowed origins from environment variable (comma-separated for multiple origins)
const getAllowedOrigins = (): string | string[] => {
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    // Support multiple origins separated by comma
    if (corsOrigin.includes(',')) {
        return corsOrigin.split(',').map(origin => origin.trim());
    }
    return corsOrigin;
};

// Middlewares
app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before /api prefix for easy access)
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api', routes);

// API health check (with /api prefix)
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// Error Handler Middleware
app.use(errorHandler);

export default app;

import dotenv from 'dotenv';
import path from 'path';

// Load .env file in development, in production env vars are set by Azure
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const config = {
    // Azure App Service sets PORT to 8080 by default
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

export default config;

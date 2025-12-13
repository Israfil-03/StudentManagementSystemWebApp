import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};

export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

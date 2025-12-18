const { ZodError } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Safe error logging - avoid circular reference issues with Prisma errors
  try {
    console.error('Error:', err.message || err);
    if (err.code) console.error('Error code:', err.code);
    if (err.stack && process.env.NODE_ENV !== 'production') {
      console.error('Stack:', err.stack);
    }
  } catch (logError) {
    console.error('Error logging failed:', logError.message);
  }

  // Custom application errors (thrown with status, message, code)
  if (err.status && err.message && err.code) {
    return sendError(res, err.status, err.message, err.code);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return sendError(res, 400, 'Validation error', 'VALIDATION_ERROR', details);
  }

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const field = err.meta?.target?.[0] || 'field';
        return sendError(res, 409, `A record with this ${field} already exists`, 'DUPLICATE_ENTRY');
      
      case 'P2025':
        // Record not found
        return sendError(res, 404, 'Record not found', 'NOT_FOUND');
      
      case 'P2003':
        // Foreign key constraint failed
        return sendError(res, 400, 'Related record not found', 'FOREIGN_KEY_ERROR');
      
      case 'P2021':
        // Table does not exist
        return sendError(res, 500, 'Database not initialized. Please contact administrator.', 'DATABASE_ERROR');
      
      default:
        console.error('Unhandled Prisma error code:', err.code);
        return sendError(res, 500, 'Database error', 'DATABASE_ERROR');
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired', 'TOKEN_EXPIRED');
  }

  // Default server error
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Unknown error';
  
  return sendError(res, 500, message, 'INTERNAL_ERROR');
};

/**
 * 404 handler for unknown routes
 */
const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND');
};

module.exports = {
  errorHandler,
  notFoundHandler
};

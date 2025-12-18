const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../db/prisma');
const { sendError } = require('../utils/response');

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required', 'UNAUTHORIZED');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired', 'TOKEN_EXPIRED');
      }
      return sendError(res, 401, 'Invalid token', 'INVALID_TOKEN');
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true
      }
    });
    
    if (!user) {
      return sendError(res, 401, 'User not found', 'USER_NOT_FOUND');
    }
    
    if (!user.active) {
      return sendError(res, 401, 'Account deactivated', 'ACCOUNT_DEACTIVATED');
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 500, 'Authentication error', 'AUTH_ERROR');
  }
};

module.exports = authenticate;

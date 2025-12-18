const { sendError } = require('../utils/response');

/**
 * Role-based access control middleware factory
 * @param {string[]} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 */
const rbac = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required', 'UNAUTHORIZED');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied. Insufficient permissions.', 'FORBIDDEN');
    }
    
    next();
  };
};

// Convenience middleware for common role combinations
const adminOnly = rbac(['SUPER_ADMIN', 'ADMIN']);
const superAdminOnly = rbac(['SUPER_ADMIN']);
const staffAndAbove = rbac(['SUPER_ADMIN', 'ADMIN', 'STAFF']);

module.exports = {
  rbac,
  adminOnly,
  superAdminOnly,
  staffAndAbove
};

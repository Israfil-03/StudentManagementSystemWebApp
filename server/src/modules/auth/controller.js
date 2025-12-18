const authService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    sendResponse(res, 200, result);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 */
const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    sendResponse(res, 200, { user });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  // With JWT, logout is client-side (delete token)
  // This endpoint exists for API completeness
  sendResponse(res, 200, { message: 'Logged out successfully' });
};

/**
 * POST /api/v1/staff
 */
const createStaff = async (req, res, next) => {
  try {
    const staff = await authService.createStaff(req.body, req.user.role);
    
    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'User',
      entityId: staff.id,
      summary: `Created ${staff.role} user: ${staff.email}`
    });
    
    sendResponse(res, 201, { staff });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

/**
 * GET /api/v1/staff
 */
const listStaff = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { q, role } = req.query;
    
    const { users, total } = await authService.listStaff({ page, limit, skip, q, role });
    
    sendResponse(res, 200, { staff: users }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/staff/:id/deactivate
 */
const deactivateStaff = async (req, res, next) => {
  try {
    const staff = await authService.deactivateStaff(req.params.id, req.user.id, req.user.role);
    
    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: staff.id,
      summary: `Deactivated user: ${staff.email}`
    });
    
    sendResponse(res, 200, { staff });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

/**
 * PATCH /api/v1/staff/:id/reactivate
 */
const reactivateStaff = async (req, res, next) => {
  try {
    const staff = await authService.reactivateStaff(req.params.id, req.user.role);
    
    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: staff.id,
      summary: `Reactivated user: ${staff.email}`
    });
    
    sendResponse(res, 200, { staff });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

/**
 * PATCH /api/v1/staff/:id/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const result = await authService.resetStaffPassword(
      req.params.id, 
      newPassword, 
      req.user.id, 
      req.user.role
    );
    
    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: req.params.id,
      summary: `Reset password for user`
    });
    
    sendResponse(res, 200, result);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

module.exports = {
  login,
  me,
  logout,
  createStaff,
  listStaff,
  deactivateStaff,
  reactivateStaff,
  resetPassword
};

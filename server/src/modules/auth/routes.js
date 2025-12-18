const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { adminOnly } = require('../../middleware/rbac');
const { 
  loginSchema, 
  createStaffSchema, 
  resetPasswordSchema,
  staffQuerySchema,
  staffIdSchema
} = require('./validation');

// Public routes
router.post('/login', validate({ body: loginSchema }), controller.login);

// Protected routes
router.get('/me', authenticate, controller.me);
router.post('/logout', authenticate, controller.logout);

// Staff management routes (Admin only)
router.post(
  '/staff',
  authenticate,
  adminOnly,
  validate({ body: createStaffSchema }),
  controller.createStaff
);

router.get(
  '/staff',
  authenticate,
  adminOnly,
  validate({ query: staffQuerySchema }),
  controller.listStaff
);

router.patch(
  '/staff/:id/deactivate',
  authenticate,
  adminOnly,
  validate({ params: staffIdSchema }),
  controller.deactivateStaff
);

router.patch(
  '/staff/:id/reactivate',
  authenticate,
  adminOnly,
  validate({ params: staffIdSchema }),
  controller.reactivateStaff
);

router.patch(
  '/staff/:id/reset-password',
  authenticate,
  adminOnly,
  validate({ params: staffIdSchema, body: resetPasswordSchema }),
  controller.resetPassword
);

module.exports = router;

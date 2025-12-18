const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { superAdminOnly } = require('../../middleware/rbac');
const { auditLogQuerySchema } = require('./validation');

// Only SUPER_ADMIN can view audit logs
router.use(authenticate, superAdminOnly);

router.get('/', validate({ query: auditLogQuerySchema }), controller.getAll);

module.exports = router;

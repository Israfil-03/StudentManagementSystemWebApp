const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');
const {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
  studentIdSchema
} = require('./validation');

// All routes require authentication and at least STAFF role
router.use(authenticate, staffAndAbove);

router.get('/', validate({ query: studentQuerySchema }), controller.getAll);
router.get('/:id', validate({ params: studentIdSchema }), controller.getById);
router.post('/', validate({ body: createStudentSchema }), controller.create);
router.put('/:id', validate({ params: studentIdSchema, body: updateStudentSchema }), controller.update);
router.delete('/:id', validate({ params: studentIdSchema }), controller.remove);

module.exports = router;

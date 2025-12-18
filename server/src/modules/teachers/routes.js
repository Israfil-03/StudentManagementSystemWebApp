const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');
const {
  createTeacherSchema,
  updateTeacherSchema,
  teacherQuerySchema,
  teacherIdSchema
} = require('./validation');

router.use(authenticate, staffAndAbove);

router.get('/', validate({ query: teacherQuerySchema }), controller.getAll);
router.get('/:id', validate({ params: teacherIdSchema }), controller.getById);
router.post('/', validate({ body: createTeacherSchema }), controller.create);
router.put('/:id', validate({ params: teacherIdSchema, body: updateTeacherSchema }), controller.update);
router.delete('/:id', validate({ params: teacherIdSchema }), controller.remove);

module.exports = router;

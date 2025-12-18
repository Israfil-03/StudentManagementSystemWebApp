const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');
const {
  createSubjectSchema,
  updateSubjectSchema,
  subjectQuerySchema,
  subjectIdSchema
} = require('./validation');

router.use(authenticate, staffAndAbove);

router.get('/', validate({ query: subjectQuerySchema }), controller.getAll);
router.get('/:id', validate({ params: subjectIdSchema }), controller.getById);
router.post('/', validate({ body: createSubjectSchema }), controller.create);
router.put('/:id', validate({ params: subjectIdSchema, body: updateSubjectSchema }), controller.update);
router.delete('/:id', validate({ params: subjectIdSchema }), controller.remove);

module.exports = router;

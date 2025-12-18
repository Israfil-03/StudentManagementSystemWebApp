const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');
const {
  createEnrollmentSchema,
  enrollmentQuerySchema,
  enrollmentIdSchema
} = require('./validation');

router.use(authenticate, staffAndAbove);

router.get('/', validate({ query: enrollmentQuerySchema }), controller.getAll);
router.get('/:id', validate({ params: enrollmentIdSchema }), controller.getById);
router.post('/', validate({ body: createEnrollmentSchema }), controller.create);
router.delete('/:id', validate({ params: enrollmentIdSchema }), controller.remove);

module.exports = router;

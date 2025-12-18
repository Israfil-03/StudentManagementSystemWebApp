const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');
const {
  createClassSchema,
  updateClassSchema,
  classQuerySchema,
  classIdSchema
} = require('./validation');

router.use(authenticate, staffAndAbove);

router.get('/', validate({ query: classQuerySchema }), controller.getAll);
router.get('/:id', validate({ params: classIdSchema }), controller.getById);
router.post('/', validate({ body: createClassSchema }), controller.create);
router.put('/:id', validate({ params: classIdSchema, body: updateClassSchema }), controller.update);
router.delete('/:id', validate({ params: classIdSchema }), controller.remove);

module.exports = router;

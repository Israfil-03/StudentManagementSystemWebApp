const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');
const {
  createFeeSchema,
  feeQuerySchema,
  feeIdSchema
} = require('./validation');

router.use(authenticate, staffAndAbove);

router.get('/', validate({ query: feeQuerySchema }), controller.getAll);
router.get('/:id', validate({ params: feeIdSchema }), controller.getById);
router.post('/', validate({ body: createFeeSchema }), controller.create);
router.patch('/:id/pay', validate({ params: feeIdSchema }), controller.markPaid);
router.delete('/:id', validate({ params: feeIdSchema }), controller.remove);

module.exports = router;

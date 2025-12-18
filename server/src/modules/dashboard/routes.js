const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');

router.use(authenticate, staffAndAbove);

router.get('/stats', controller.getStats);

module.exports = router;

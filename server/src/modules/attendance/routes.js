const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { staffAndAbove } = require('../../middleware/rbac');
const {
  createAttendanceSchema,
  attendanceQuerySchema,
  studentIdParamSchema
} = require('./validation');

router.use(authenticate, staffAndAbove);

router.get('/', validate({ query: attendanceQuerySchema }), controller.getAll);
router.post('/', validate({ body: createAttendanceSchema }), controller.markAttendance);
router.get('/history/:studentId', validate({ params: studentIdParamSchema }), controller.getStudentHistory);

module.exports = router;

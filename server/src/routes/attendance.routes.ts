import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// POST /api/attendance - Mark attendance for a student (Teacher, Admin)
router.post('/', authorize('ADMIN', 'TEACHER'), attendanceController.markAttendance);

// POST /api/attendance/bulk - Mark attendance for multiple students (Teacher, Admin)
router.post('/bulk', authorize('ADMIN', 'TEACHER'), attendanceController.markBulkAttendance);

// GET /api/attendance/me - Get current student's attendance (Student only)
router.get('/me', authorize('STUDENT'), attendanceController.getMyAttendance);

// GET /api/attendance/class/:classId - Get attendance by class (Teacher, Admin)
router.get('/class/:classId', authorize('ADMIN', 'TEACHER'), attendanceController.getAttendanceByClass);

// GET /api/attendance/student/:studentId - Get attendance by student (Teacher, Admin)
router.get('/student/:studentId', authorize('ADMIN', 'TEACHER'), attendanceController.getAttendanceByStudent);

// GET /api/attendance/stats/:studentId - Get attendance stats (Teacher, Admin)
router.get('/stats/:studentId', authorize('ADMIN', 'TEACHER'), attendanceController.getAttendanceStats);

export default router;

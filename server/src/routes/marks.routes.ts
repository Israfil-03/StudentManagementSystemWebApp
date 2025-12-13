import { Router } from 'express';
import * as marksController from '../controllers/marks.controller';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// POST /api/marks - Add/update a mark (Teacher, Admin)
router.post('/', authorize('ADMIN', 'TEACHER'), marksController.addMark);

// GET /api/marks/me - Get current student's marks (Student only)
router.get('/me', authorize('STUDENT'), marksController.getMyMarks);

// GET /api/marks/student/:studentId - Get marks by student (Teacher, Admin)
router.get('/student/:studentId', authorize('ADMIN', 'TEACHER'), marksController.getMarksByStudent);

// GET /api/marks/subject/:subjectId - Get marks by subject (Teacher, Admin)
router.get('/subject/:subjectId', authorize('ADMIN', 'TEACHER'), marksController.getMarksBySubject);

// GET /api/marks/class/:classId - Get marks by class (Teacher, Admin)
router.get('/class/:classId', authorize('ADMIN', 'TEACHER'), marksController.getMarksByClass);

// GET /api/marks/stats/:studentId - Get student stats (All authenticated)
router.get('/stats/:studentId', marksController.getStudentStats);

// DELETE /api/marks/:id - Delete a mark (Admin only)
router.delete('/:id', authorize('ADMIN'), marksController.deleteMark);

export default router;

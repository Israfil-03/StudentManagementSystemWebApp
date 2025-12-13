import { Router } from 'express';
import * as studentController from '../controllers/student.controller';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// GET /api/students - Get all students (Admin, Teacher)
router.get('/', authorize('ADMIN', 'TEACHER'), studentController.getAllStudents);

// GET /api/students/me - Get current student's profile (Student only)
router.get('/me', authorize('STUDENT'), studentController.getMyProfile);

// GET /api/students/:id - Get student by ID (Admin, Teacher)
router.get('/:id', authorize('ADMIN', 'TEACHER'), studentController.getStudentById);

// PUT /api/students/:id - Update student (Admin only)
router.put('/:id', authorize('ADMIN'), studentController.updateStudent);

// DELETE /api/students/:id - Delete student (Admin only)
router.delete('/:id', authorize('ADMIN'), studentController.deleteStudent);

// POST /api/students/:id/assign-class - Assign student to class (Admin only)
router.post('/:id/assign-class', authorize('ADMIN'), studentController.assignToClass);

// POST /api/students/:id/remove-class - Remove student from class (Admin only)
router.post('/:id/remove-class', authorize('ADMIN'), studentController.removeFromClass);

export default router;

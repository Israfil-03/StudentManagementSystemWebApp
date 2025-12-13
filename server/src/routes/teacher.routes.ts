import { Router } from 'express';
import * as teacherController from '../controllers/teacher.controller';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// GET /api/teachers - Get all teachers (Admin only)
router.get('/', authorize('ADMIN'), teacherController.getAllTeachers);

// GET /api/teachers/me - Get current teacher's profile (Teacher only)
router.get('/me', authorize('TEACHER'), teacherController.getMyProfile);

// GET /api/teachers/:id - Get teacher by ID (Admin only)
router.get('/:id', authorize('ADMIN'), teacherController.getTeacherById);

// PUT /api/teachers/:id - Update teacher (Admin only)
router.put('/:id', authorize('ADMIN'), teacherController.updateTeacher);

// DELETE /api/teachers/:id - Delete teacher (Admin only)
router.delete('/:id', authorize('ADMIN'), teacherController.deleteTeacher);

// POST /api/teachers/:id/assign-class - Assign teacher to class (Admin only)
router.post('/:id/assign-class', authorize('ADMIN'), teacherController.assignToClass);

export default router;

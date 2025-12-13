import { Router } from 'express';
import * as classController from '../controllers/class.controller';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// GET /api/classes - Get all classes (Admin, Teacher)
router.get('/', authorize('ADMIN', 'TEACHER'), classController.getAllClasses);

// GET /api/classes/:id - Get class by ID (Admin, Teacher)
router.get('/:id', authorize('ADMIN', 'TEACHER'), classController.getClassById);

// POST /api/classes - Create a new class (Admin only)
router.post('/', authorize('ADMIN'), classController.createClass);

// PUT /api/classes/:id - Update class (Admin only)
router.put('/:id', authorize('ADMIN'), classController.updateClass);

// DELETE /api/classes/:id - Delete class (Admin only)
router.delete('/:id', authorize('ADMIN'), classController.deleteClass);

// POST /api/classes/:id/subjects - Add subject to class (Admin only)
router.post('/:id/subjects', authorize('ADMIN'), classController.addSubject);

// DELETE /api/classes/:id/subjects/:subjectId - Remove subject from class (Admin only)
router.delete('/:id/subjects/:subjectId', authorize('ADMIN'), classController.removeSubject);

export default router;

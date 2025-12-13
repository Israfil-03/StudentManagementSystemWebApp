import { Router } from 'express';
import * as subjectController from '../controllers/subject.controller';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// GET /api/subjects - Get all subjects (All authenticated users)
router.get('/', subjectController.getAllSubjects);

// GET /api/subjects/:id - Get subject by ID (All authenticated users)
router.get('/:id', subjectController.getSubjectById);

// POST /api/subjects - Create a new subject (Admin only)
router.post('/', authorize('ADMIN'), subjectController.createSubject);

// PUT /api/subjects/:id - Update subject (Admin only)
router.put('/:id', authorize('ADMIN'), subjectController.updateSubject);

// DELETE /api/subjects/:id - Delete subject (Admin only)
router.delete('/:id', authorize('ADMIN'), subjectController.deleteSubject);

export default router;

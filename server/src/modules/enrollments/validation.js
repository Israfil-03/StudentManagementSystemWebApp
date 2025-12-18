const { z } = require('zod');

const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  classSectionId: z.string().uuid('Invalid class ID'),
  academicYear: z.string().min(1, 'Academic year is required')
});

const enrollmentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  studentId: z.string().uuid().optional(),
  classSectionId: z.string().uuid().optional(),
  academicYear: z.string().optional()
});

const enrollmentIdSchema = z.object({
  id: z.string().uuid('Invalid enrollment ID')
});

module.exports = {
  createEnrollmentSchema,
  enrollmentQuerySchema,
  enrollmentIdSchema
};

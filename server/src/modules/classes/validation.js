const { z } = require('zod');

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  section: z.string().nullable().optional(),
  grade: z.string().min(1, 'Grade is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  roomNumber: z.string().nullable().optional(),
  capacity: z.number().int().positive().optional().default(40),
  classTeacherId: z.string().uuid().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

const updateClassSchema = createClassSchema.partial();

const classQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  academicYear: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  sort: z.string().optional()
});

const classIdSchema = z.object({
  id: z.string().uuid('Invalid class ID')
});

module.exports = {
  createClassSchema,
  updateClassSchema,
  classQuerySchema,
  classIdSchema
};

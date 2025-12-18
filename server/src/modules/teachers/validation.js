const { z } = require('zod');

const createTeacherSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  qualification: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional()
});

const updateTeacherSchema = createTeacherSchema.partial().omit({ employeeId: true });

const teacherQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
  sort: z.string().optional()
});

const teacherIdSchema = z.object({
  id: z.string().uuid('Invalid teacher ID')
});

module.exports = {
  createTeacherSchema,
  updateTeacherSchema,
  teacherQuerySchema,
  teacherIdSchema
};

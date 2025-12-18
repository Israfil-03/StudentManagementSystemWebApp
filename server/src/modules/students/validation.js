const { z } = require('zod');

const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email').nullable().optional(),
  phone: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().nullable().optional(),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: z.string().min(1, 'Guardian phone is required'),
  guardianEmail: z.string().email('Invalid email').nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']).optional()
});

const updateStudentSchema = createStudentSchema.partial();

const studentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']).optional(),
  sort: z.string().optional()
});

const studentIdSchema = z.object({
  id: z.string().uuid('Invalid student ID')
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
  studentIdSchema
};

const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'STAFF'], {
    errorMap: () => ({ message: 'Role must be ADMIN or STAFF' })
  })
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

const staffQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF', 'SUPER_ADMIN']).optional()
});

const staffIdSchema = z.object({
  id: z.string().uuid('Invalid staff ID')
});

module.exports = {
  loginSchema,
  createStaffSchema,
  resetPasswordSchema,
  staffQuerySchema,
  staffIdSchema
};

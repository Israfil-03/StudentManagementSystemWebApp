const { z } = require('zod');

const createFeeSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required')
});

const feeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  studentId: z.string().uuid().optional(),
  status: z.enum(['DUE', 'PAID']).optional()
});

const feeIdSchema = z.object({
  id: z.string().uuid('Invalid fee ID')
});

module.exports = {
  createFeeSchema,
  feeQuerySchema,
  feeIdSchema
};

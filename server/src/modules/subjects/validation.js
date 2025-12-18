const { z } = require('zod');

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required')
});

const updateSubjectSchema = createSubjectSchema.partial();

const subjectQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().optional()
});

const subjectIdSchema = z.object({
  id: z.string().uuid('Invalid subject ID')
});

module.exports = {
  createSubjectSchema,
  updateSubjectSchema,
  subjectQuerySchema,
  subjectIdSchema
};

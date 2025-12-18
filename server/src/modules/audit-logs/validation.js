const { z } = require('zod');

const auditLogQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  entity: z.string().optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
  actorId: z.string().uuid().optional()
});

module.exports = {
  auditLogQuerySchema
};

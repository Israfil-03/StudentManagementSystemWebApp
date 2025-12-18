const prisma = require('../../db/prisma');

const getAll = async ({ page, limit, skip, entity, action, actorId }) => {
  const where = {};
  
  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (actorId) where.actorUserId = actorId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total };
};

module.exports = {
  getAll
};

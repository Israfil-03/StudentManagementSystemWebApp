const prisma = require('../db/prisma');

/**
 * Create an audit log entry
 * @param {object} params
 * @param {string} params.actorUserId - User who performed the action
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE)
 * @param {string} params.entity - Entity name (Student, Teacher, etc.)
 * @param {string} params.entityId - ID of the affected entity
 * @param {string} params.summary - Human-readable summary of the change
 */
const createAuditLog = async ({ actorUserId, action, entity, entityId, summary }) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        entity,
        entityId,
        summary
      }
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break main operations
    console.error('Failed to create audit log:', error.message);
  }
};

module.exports = {
  createAuditLog
};

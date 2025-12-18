const subjectService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { q } = req.query;

    const { subjects, total } = await subjectService.getAll({ page, limit, skip, q });

    sendResponse(res, 200, { subjects }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const subject = await subjectService.getById(req.params.id);
    sendResponse(res, 200, { subject });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const subject = await subjectService.create(req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'Subject',
      entityId: subject.id,
      summary: `Created subject: ${subject.name} (${subject.code})`
    });

    sendResponse(res, 201, { subject });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const subject = await subjectService.update(req.params.id, req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'Subject',
      entityId: subject.id,
      summary: `Updated subject: ${subject.name}`
    });

    sendResponse(res, 200, { subject });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await subjectService.remove(req.params.id);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'DELETE',
      entity: 'Subject',
      entityId: req.params.id,
      summary: 'Deleted subject'
    });

    sendResponse(res, 200, result);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};

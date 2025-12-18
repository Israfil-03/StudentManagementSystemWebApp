const teacherService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta, parseSort } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

const ALLOWED_SORT_FIELDS = ['name', 'email', 'createdAt', 'updatedAt', 'subjectSpecialty'];

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { q, sort } = req.query;
    const orderBy = parseSort(sort, ALLOWED_SORT_FIELDS);

    const { teachers, total } = await teacherService.getAll({ 
      page, limit, skip, q, orderBy 
    });

    sendResponse(res, 200, { teachers }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const teacher = await teacherService.getById(req.params.id);
    sendResponse(res, 200, { teacher });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const teacher = await teacherService.create(req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'Teacher',
      entityId: teacher.id,
      summary: `Created teacher: ${teacher.name}`
    });

    sendResponse(res, 201, { teacher });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const teacher = await teacherService.update(req.params.id, req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'Teacher',
      entityId: teacher.id,
      summary: `Updated teacher: ${teacher.name}`
    });

    sendResponse(res, 200, { teacher });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await teacherService.remove(req.params.id);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'DELETE',
      entity: 'Teacher',
      entityId: req.params.id,
      summary: 'Deleted teacher'
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

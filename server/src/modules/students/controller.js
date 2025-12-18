const studentService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta, parseSort } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

const ALLOWED_SORT_FIELDS = ['firstName', 'lastName', 'studentId', 'createdAt', 'updatedAt', 'status'];

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { q, status, sort } = req.query;
    const orderBy = parseSort(sort, ALLOWED_SORT_FIELDS);

    const { students, total } = await studentService.getAll({ 
      page, limit, skip, q, status, orderBy 
    });

    sendResponse(res, 200, { students }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const student = await studentService.getById(req.params.id);
    sendResponse(res, 200, { student });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const student = await studentService.create(req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'Student',
      entityId: student.id,
      summary: `Created student: ${student.firstName} ${student.lastName} (${student.studentId})`
    });

    sendResponse(res, 201, { student });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const student = await studentService.update(req.params.id, req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'Student',
      entityId: student.id,
      summary: `Updated student: ${student.name}`
    });

    sendResponse(res, 200, { student });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await studentService.remove(req.params.id);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'DELETE',
      entity: 'Student',
      entityId: req.params.id,
      summary: 'Deleted student'
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

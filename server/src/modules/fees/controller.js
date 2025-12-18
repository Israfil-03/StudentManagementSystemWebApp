const feeService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { studentId, status } = req.query;

    const { fees, total } = await feeService.getAll({ page, limit, skip, studentId, status });

    sendResponse(res, 200, { fees }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const fee = await feeService.getById(req.params.id);
    sendResponse(res, 200, { fee });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const fee = await feeService.create(req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'Fee',
      entityId: fee.id,
      summary: `Created fee of ${fee.amount} for ${fee.student.name}`
    });

    sendResponse(res, 201, { fee });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const markPaid = async (req, res, next) => {
  try {
    const fee = await feeService.markPaid(req.params.id);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'Fee',
      entityId: fee.id,
      summary: `Marked fee as paid: ${fee.amount} for ${fee.student.name}`
    });

    sendResponse(res, 200, { fee });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await feeService.remove(req.params.id);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'DELETE',
      entity: 'Fee',
      entityId: req.params.id,
      summary: 'Deleted fee record'
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
  markPaid,
  remove
};

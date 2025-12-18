const classService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta, parseSort } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

const ALLOWED_SORT_FIELDS = ['name', 'academicYear', 'createdAt', 'capacity'];

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { academicYear, sort, search, status } = req.query;
    const orderBy = parseSort(sort, ALLOWED_SORT_FIELDS);

    const { classes, total } = await classService.getAll({ 
      page, limit, skip, search, status, academicYear, orderBy 
    });

    sendResponse(res, 200, { classes }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const classSection = await classService.getById(req.params.id);
    sendResponse(res, 200, { class: classSection });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const classSection = await classService.create(req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'ClassSection',
      entityId: classSection.id,
      summary: `Created class: ${classSection.name} (${classSection.academicYear})`
    });

    sendResponse(res, 201, { class: classSection });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const classSection = await classService.update(req.params.id, req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'UPDATE',
      entity: 'ClassSection',
      entityId: classSection.id,
      summary: `Updated class: ${classSection.name}`
    });

    sendResponse(res, 200, { class: classSection });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await classService.remove(req.params.id);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'DELETE',
      entity: 'ClassSection',
      entityId: req.params.id,
      summary: 'Deleted class'
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

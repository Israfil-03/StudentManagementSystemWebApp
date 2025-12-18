const enrollmentService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { studentId, classSectionId, academicYear } = req.query;

    const { enrollments, total } = await enrollmentService.getAll({ 
      page, limit, skip, studentId, classSectionId, academicYear 
    });

    sendResponse(res, 200, { enrollments }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.getById(req.params.id);
    sendResponse(res, 200, { enrollment });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const enrollment = await enrollmentService.create(req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'Enrollment',
      entityId: enrollment.id,
      summary: `Enrolled ${enrollment.student.name} in ${enrollment.classSection.name}`
    });

    sendResponse(res, 201, { enrollment });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await enrollmentService.remove(req.params.id);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'DELETE',
      entity: 'Enrollment',
      entityId: req.params.id,
      summary: 'Deleted enrollment'
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
  remove
};

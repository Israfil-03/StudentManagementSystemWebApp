const attendanceService = require('./service');
const { sendResponse, sendError, getPagination, buildPaginationMeta } = require('../../utils/response');
const { createAuditLog } = require('../../utils/audit');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { classSectionId, date, startDate, endDate, studentId } = req.query;

    const { attendance, total } = await attendanceService.getAll({ 
      page, limit, skip, classSectionId, date, startDate, endDate, studentId 
    });

    sendResponse(res, 200, { attendance }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.markAttendance(req.body);

    await createAuditLog({
      actorUserId: req.user.id,
      action: 'CREATE',
      entity: 'Attendance',
      entityId: result.classSectionId,
      summary: `Marked attendance for ${result.classSection} on ${result.date.toISOString().split('T')[0]} (${result.recordCount} records)`
    });

    sendResponse(res, 201, result);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

const getStudentHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { studentId } = req.params;

    const result = await attendanceService.getStudentHistory(studentId, { page, limit, skip });

    sendResponse(res, 200, result, buildPaginationMeta(result.total, page, limit));
  } catch (error) {
    if (error.status) {
      return sendError(res, error.status, error.message, error.code);
    }
    next(error);
  }
};

module.exports = {
  getAll,
  markAttendance,
  getStudentHistory
};

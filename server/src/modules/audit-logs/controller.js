const auditLogService = require('./service');
const { sendResponse, getPagination, buildPaginationMeta } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { entity, action, actorId } = req.query;

    const { logs, total } = await auditLogService.getAll({ 
      page, limit, skip, entity, action, actorId 
    });

    sendResponse(res, 200, { logs }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll
};

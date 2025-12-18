const dashboardService = require('./service');
const { sendResponse } = require('../../utils/response');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    sendResponse(res, 200, stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};

/**
 * Standard API response helper
 */
const sendResponse = (res, statusCode, data, meta = null) => {
  res.status(statusCode).json({
    data,
    error: null,
    meta
  });
};

/**
 * Standard error response helper
 */
const sendError = (res, statusCode, message, code = 'ERROR', details = null) => {
  res.status(statusCode).json({
    data: null,
    error: {
      message,
      code,
      details
    },
    meta: null
  });
};

/**
 * Pagination helper
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build pagination meta
 */
const buildPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Parse sort parameter
 * @param {string} sortParam - Format: "field:asc" or "field:desc"
 * @param {string[]} allowedFields - List of allowed sort fields
 * @returns {object|undefined} Prisma orderBy object
 */
const parseSort = (sortParam, allowedFields = []) => {
  if (!sortParam) return undefined;
  
  const [field, direction] = sortParam.split(':');
  
  if (!field || !allowedFields.includes(field)) {
    return undefined;
  }
  
  const order = direction?.toLowerCase() === 'desc' ? 'desc' : 'asc';
  return { [field]: order };
};

module.exports = {
  sendResponse,
  sendError,
  getPagination,
  buildPaginationMeta,
  parseSort
};

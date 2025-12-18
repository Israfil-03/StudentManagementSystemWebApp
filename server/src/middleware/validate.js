const { sendError } = require('../utils/response');

/**
 * Clean query parameters - remove empty strings
 * @param {object} query - Query object
 * @returns {object} Cleaned query object
 */
const cleanQuery = (query) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(query)) {
    // Only include non-empty values
    if (value !== '' && value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

/**
 * Validation middleware factory
 * Validates request body, query, and params against Zod schemas
 * @param {object} schemas - Object containing body, query, params schemas
 */
const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      
      if (schemas.query) {
        // Clean empty strings from query before validation
        const cleanedQuery = cleanQuery(req.query);
        req.query = schemas.query.parse(cleanedQuery);
      }
      
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      // Let error handler deal with ZodError
      next(error);
    }
  };
};

module.exports = validate;

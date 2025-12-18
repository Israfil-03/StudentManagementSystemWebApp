const { sendError } = require('../utils/response');

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
        req.query = schemas.query.parse(req.query);
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

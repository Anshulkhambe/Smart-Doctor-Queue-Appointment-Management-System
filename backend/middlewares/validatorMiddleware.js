const { validationResult } = require('express-validator');

/**
 * Middleware to process express-validator results.
 * If errors are found, sends a 400 response with error details.
 * Otherwise, transfers control to the next middleware.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = validate;

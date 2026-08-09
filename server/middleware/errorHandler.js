const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, requestId: req.requestId });
  
  let error = { ...err, message: err.message };
  
  if (err.name === 'CastError') error = { statusCode: 400, code: 'RESOURCE_NOT_FOUND', message: 'Resource not found' };
  if (err.code === 11000) error = { statusCode: 409, code: 'DUPLICATE_FIELD', message: 'Duplicate field value entered' };
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(v => v.message).join(', ');
    error = { statusCode: 422, code: 'VALIDATION_ERROR', message: msg };
  }
  if (err.name === 'JsonWebTokenError') error = { statusCode: 401, code: 'INVALID_TOKEN', message: 'Invalid token' };
  if (err.name === 'TokenExpiredError') error = { statusCode: 401, code: 'TOKEN_EXPIRED', message: 'Token expired' };

  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    error: {
      code: error.code || `HTTP_${statusCode}`,
      message: error.message || 'An unexpected server error occurred'
    }
  };
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;

  res.status(statusCode).json(payload);
};

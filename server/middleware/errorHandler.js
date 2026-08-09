const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, requestId: req.requestId });
  
  let error = { ...err, message: err.message };
  
  if (err.name === 'CastError') error = { statusCode: 400, message: 'Resource not found' };
  if (err.code === 11000) error = { statusCode: 409, message: 'Duplicate field value entered' };
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(v => v.message).join(', ');
    error = { statusCode: 422, message: msg };
  }
  if (err.name === 'JsonWebTokenError') error = { statusCode: 401, message: 'Invalid token' };
  if (err.name === 'TokenExpiredError') error = { statusCode: 401, message: 'Token expired' };
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errors: error.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    timestamp: new Date()
  });
};

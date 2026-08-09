const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, requestId: req.requestId });
  
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Server Error';
  
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists.';
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors || {}).map(v => v.message).join(', ');
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    timestamp: new Date()
  });
};

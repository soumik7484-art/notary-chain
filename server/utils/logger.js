const winston = require('winston');

const transports = [];

// On serverless environments (Vercel) or production, use Console transport
if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
  transports.push(new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.simple())
  }));
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports
});

module.exports = logger;

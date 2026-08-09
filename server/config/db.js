const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Disable Mongoose command buffering so queries fail-fast when MongoDB is offline
mongoose.set('bufferCommands', false);

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB Connected');
    mongoose.connection.on('error', (e) => logger.error('DB Error:', e));
    mongoose.connection.on('disconnected', () => logger.warn('DB Disconnected'));
  } catch (err) {
    logger.error('MongoDB connection failed', { message: err.message });
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
    logger.warn('Continuing without MongoDB in development. Database-dependent routes may fail.');
  }
};

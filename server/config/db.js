const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Disable Mongoose command buffering so queries fail-fast when MongoDB is offline
mongoose.set('bufferCommands', false);

exports.connectDB = async () => {
  let retries = 3;
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('MongoDB Connected');
      mongoose.connection.on('error', e => logger.error('DB Error:', e));
      mongoose.connection.on('disconnected', () => logger.warn('DB Disconnected'));
      return;
    } catch (err) {
      logger.warn('MongoDB not reachable at ' + process.env.MONGODB_URI + ' — server running in demo mode');
      return;
    }
  }
};

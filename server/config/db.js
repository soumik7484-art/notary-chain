const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Enable Mongoose command buffering so serverless cold-starts await DB connection
mongoose.set('bufferCommands', true);

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) return;
  isConnecting = true;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.warn('MONGODB_URI not configured — server running with fallback storage');
    isConnecting = false;
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    logger.info('MongoDB Connected successfully');
  } catch (err) {
    logger.warn('MongoDB Connection Warning: ' + err.message);
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('error', e => logger.error('MongoDB Event Error:', e ? e.message : e));
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB Disconnected — attempting automatic reconnection');
  connectDB().catch(() => {});
});

exports.connectDB = connectDB;

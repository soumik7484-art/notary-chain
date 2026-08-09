const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const env = process.env;

if (!env.MONGODB_URI || !env.JWT_SECRET || !env.JWT_REFRESH_SECRET) {
  throw new Error('Missing required env vars');
}

module.exports = {
  PORT: env.PORT || 5000,
  NODE_ENV: env.NODE_ENV || 'development',
  MONGODB_URI: env.MONGODB_URI,
  JWT_SECRET: env.JWT_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  CLIENT_URL: env.CLIENT_URL || 'http://localhost:3000',
  JWT_EXPIRE: env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: env.JWT_REFRESH_EXPIRE || '7d',
  SMTP: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  ENCRYPTION_KEY: env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  MAX_FILE_SIZE: env.MAX_FILE_SIZE || 52428800,
  UPLOAD_PATH: env.UPLOAD_PATH || 'uploads/',
  RATE_LIMIT: env.RATE_LIMIT || 100,
  AI_SERVICE_URL: env.AI_SERVICE_URL || 'http://localhost:5001',
  LOG_LEVEL: env.LOG_LEVEL || 'info',
  FREIGHTER_TESTNET_WALLET: env.FREIGHTER_TESTNET_WALLET || 'GBT73LMEDNGASAHFDULIEINFWZVLWTPJVK6Q3OEGGW6G54AHENA3JLDA'
};

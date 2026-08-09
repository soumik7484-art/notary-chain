const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const env = process.env;

if (!env.MONGODB_URI || !env.JWT_SECRET || !env.JWT_REFRESH_SECRET) {
  throw new Error('Missing required env vars');
}

const parseList = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseBoolean = (value, fallback) =>
  value === undefined ? fallback : value === 'true';

module.exports = {
  PORT: Number(env.PORT) || 5000,
  NODE_ENV: env.NODE_ENV || 'development',
  MONGODB_URI: env.MONGODB_URI,
  JWT_SECRET: env.JWT_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  CLIENT_URL: env.CLIENT_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: parseList(env.ALLOWED_ORIGINS || env.CLIENT_URL || 'http://localhost:3000'),
  JWT_EXPIRE: env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: env.JWT_REFRESH_EXPIRE || '7d',
  SMTP: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  },
  ENCRYPTION_KEY: env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  MAX_FILE_SIZE: Number(env.MAX_FILE_SIZE) || 52428800,
  UPLOAD_PATH: env.UPLOAD_PATH || 'uploads/',
  RATE_LIMIT: Number(env.RATE_LIMIT) || 100,
  AI_SERVICE_URL: env.AI_SERVICE_URL || 'http://localhost:5001',
  LOG_LEVEL: env.LOG_LEVEL || 'info',
  ALLOW_DEMO_AUTH: parseBoolean(env.ALLOW_DEMO_AUTH, env.NODE_ENV !== 'production'),
  FREIGHTER_TESTNET_WALLET: env.FREIGHTER_TESTNET_WALLET || 'GBT73LMEDNGASAHFDULIEINFWZVLWTPJVK6Q3OEGGW6G54AHENA3JLDA'
};

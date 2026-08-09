const path = require('path');

// Try loading .env from multiple locations (root project, server dir)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config(); // also try CWD

const env = process.env;

// Warn instead of crashing — Vercel sets env vars via dashboard, not .env files
if (!env.MONGODB_URI || !env.JWT_SECRET || !env.JWT_REFRESH_SECRET) {
  console.warn('[ENV WARNING] Missing one or more required env vars (MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET). Server will start with defaults but auth/DB features may not work. Set these in your Vercel project dashboard.');
}

module.exports = {
  PORT: env.PORT || 5000,
  NODE_ENV: env.NODE_ENV || 'production',
  MONGODB_URI: env.MONGODB_URI || '',
  JWT_SECRET: env.JWT_SECRET || 'notarychain-fallback-jwt-secret-2024',
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET || 'notarychain-fallback-refresh-secret-2024',
  CLIENT_URL: env.CLIENT_URL || 'https://client-phi-three-35.vercel.app',
  JWT_EXPIRE: env.JWT_EXPIRE || '7d',
  JWT_REFRESH_EXPIRE: env.JWT_REFRESH_EXPIRE || '30d',
  GROQ_API_KEY: env.GROQ_API_KEY || '',
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
  FREIGHTER_TESTNET_WALLET: env.FREIGHTER_TESTNET_WALLET || 'GBT73LMEDNGASAHFDULIEINFWZVLWTPJVK6Q3OEGGW6G54AHENA3JLDA',
  POLYGON_AMOY_RPC_URL: env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com',
  BLOCKCHAIN_PRIVATE_KEY: env.BLOCKCHAIN_PRIVATE_KEY || '',
  CONTRACT_ADDRESS: env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000001010',
  FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID || 'notarychain-95523',
};


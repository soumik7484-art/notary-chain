const { NODE_ENV, CLIENT_URL, ALLOWED_ORIGINS } = require('./env');

const defaultOrigins = [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];
const allowedOrigins = Array.from(new Set([...(ALLOWED_ORIGINS || defaultOrigins), ...defaultOrigins]));
const localHostPattern = /^https?:\/\/localhost(:\d+)?$/;
const localIpPattern = /^https?:\/\/127\.0\.0\.1(:\d+)?$/;

module.exports = {
  origin: function (origin, cb) {
    if (!origin) {
      return cb(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    if (NODE_ENV !== 'production' && (localHostPattern.test(origin) || localIpPattern.test(origin))) {
      return cb(null, true);
    }
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Info']
};

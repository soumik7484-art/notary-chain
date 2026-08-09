const { CLIENT_URL } = require('./env');

module.exports = {
  origin: function (origin, cb) {
    // Allow Vercel deployments, localhost, and configured client URL
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      cb(null, true);
    } else {
      cb(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Info', 'X-Screen-Resolution']
};

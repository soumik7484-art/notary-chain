const { CLIENT_URL } = require('./env');

module.exports = {
  origin: function (origin, cb) {
    const whitelist = [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Info']
};

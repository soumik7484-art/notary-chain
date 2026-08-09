const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { setupSecurity } = require('./middleware/security');
const corsConfig = require('./config/cors');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorHandler');
const { extractDeviceInfo } = require('./middleware/deviceInfo');
const logger = require('./utils/logger');

const app = express();

setupSecurity(app);
app.use(cors(corsConfig));
if (env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(extractDeviceInfo);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), uptime: process.uptime(), environment: env.NODE_ENV });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/verifications', require('./routes/verificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/neobank', require('./routes/neobankRoutes'));
app.use('/api/face', require('./routes/faceRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));


app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => logger.info(`Server running on port ${env.PORT}`));
  } catch (e) {
    logger.error('Startup error', e);
    process.exit(1);
  }
};
start();

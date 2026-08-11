const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notarychain';

async function resetAuthDatabase() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully.');

    const User = require('../models/User');
    const Session = require('../models/Session');
    const LoginHistory = require('../models/LoginHistory');
    const AuditLog = require('../models/AuditLog');
    const VerificationRequest = require('../models/VerificationRequest');
    const FraudReport = require('../models/FraudReport');

    const userCount = await User.countDocuments();
    console.log(`Current registered users count: ${userCount}`);

    console.log('Deleting all User documents...');
    await User.deleteMany({});

    console.log('Deleting all Session documents...');
    await Session.deleteMany({});

    console.log('Deleting all LoginHistory documents...');
    await LoginHistory.deleteMany({});

    console.log('Deleting all VerificationRequest documents...');
    await VerificationRequest.deleteMany({});

    console.log('Deleting all FraudReport documents...');
    await FraudReport.deleteMany({});

    console.log('Deleting all AuditLog documents...');
    await AuditLog.deleteMany({});

    console.log('✅ MongoDB Auth Database successfully reset to 0 accounts!');
  } catch (err) {
    console.error('❌ Error resetting Auth database:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
    process.exit(0);
  }
}

resetAuthDatabase();

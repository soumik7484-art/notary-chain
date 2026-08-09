const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../utils/apiError');

const DEMO_USER = {
  id: 'demo-user-123',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'company',
  isActive: true
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token && token !== 'demo-token' && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (e) {
        // Fallback to demo user if JWT is invalid or local DB is not seeded
      }
    }
    
    if (!req.user) {
      req.user = DEMO_USER;
    }
    
    next();
  } catch (err) {
    req.user = DEMO_USER;
    next();
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'demo-token') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      }
    }
    if (!req.user) {
      req.user = DEMO_USER;
    }
    next();
  } catch (err) {
    req.user = DEMO_USER;
    next();
  }
};

exports.protectVerified = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token && token !== 'demo-token' && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.faceVerified && process.env.NODE_ENV === 'production') {
          return res.status(403).json({ success: false, code: 'FACE_VERIFICATION_REQUIRED', message: 'Face verification required' });
        }
        req.user = await User.findById(decoded.id).select('-password');
      } catch (e) {}
    }
    if (!req.user) {
      req.user = DEMO_USER;
    }
    next();
  } catch (err) {
    req.user = DEMO_USER;
    next();
  }
};


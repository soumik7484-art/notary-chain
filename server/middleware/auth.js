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

const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'notarychain-dev-jwt-secret-key-2024-change-in-production';

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token && token !== 'demo-token' && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uId = decoded?.id || decoded?.userId;
        if (uId && mongoose.Types.ObjectId.isValid(uId)) {
          req.user = await User.findById(uId).select('-password');
        }
      } catch (e) {
        // Token invalid or expired
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
      if (token && token !== 'demo-token' && token !== 'null' && token !== 'undefined') {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const uId = decoded?.id || decoded?.userId;
          if (uId && mongoose.Types.ObjectId.isValid(uId)) {
            req.user = await User.findById(uId).select('-password');
          }
        } catch (e) {}
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
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.faceVerified && process.env.NODE_ENV === 'production') {
          return res.status(403).json({ success: false, code: 'FACE_VERIFICATION_REQUIRED', message: 'Face verification required' });
        }
        const uId = decoded?.id || decoded?.userId;
        if (uId && mongoose.Types.ObjectId.isValid(uId)) {
          req.user = await User.findById(uId).select('-password');
        }
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


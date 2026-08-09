const User = require('../models/User');
const resU = require('../utils/apiResponse');
const tokenService = require('../services/tokenService');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const faceService = require('../services/faceRecognitionService');

/**
 * Register Face Biometric Vector directly in MongoDB
 */
exports.registerFace = async (req, res, next) => {
  try {
    const { faceDescriptor, imageBase64 } = req.body;

    let descriptor = faceDescriptor;
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length < 64) {
      if (imageBase64) {
        descriptor = faceService.extract128DFacialDescriptor(imageBase64);
      } else {
        return res.status(400).json({ success: false, message: 'Valid 128D face descriptor vector is required' });
      }
    }

    const userId = req.user?._id || req.user?.id;
    const normalizedDescriptor = faceService.normalize128DFacialDescriptor(descriptor);

    let user = null;
    if (userId && require('mongoose').Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user && req.user?.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase().trim() });
    }

    if (user) {
      user.faceEmbedding = normalizedDescriptor;
      user.faceVerified = true;
      user.verificationDate = Date.now();
      user.lastVerification = Date.now();
      await user.save();
    }

    return resU.success(res, {
      faceVerified: true,
      vectorLength: normalizedDescriptor.length,
      user: require('../utils/helpers').sanitizeUser(user || req.user)
    }, '128D Face Biometric Key registered in MongoDB successfully!');
  } catch (err) {
    next(err);
  }
};

/**
 * Recognize Face & Log In User via MongoDB Biometric Descriptors (Strict 93.0% Match Mandate)
 */
exports.recognizeAndLogin = async (req, res, next) => {
  try {
    const { faceDescriptor, email, imageBase64 } = req.body;

    let currentDescriptor = faceDescriptor;
    if (!currentDescriptor || !Array.isArray(currentDescriptor) || currentDescriptor.length < 64) {
      if (imageBase64) {
        currentDescriptor = faceService.extract128DFacialDescriptor(imageBase64);
      } else {
        return res.status(400).json({ success: false, authenticated: false, message: 'Valid 128D face descriptor vector is required' });
      }
    }

    // Normalize incoming 128D vector
    const normalizedCurrent = faceService.normalize128DFacialDescriptor(currentDescriptor);

    // If target email specified, query that specific user from MongoDB
    let enrolledUsers = [];
    if (email) {
      const u = await User.findOne({ email, isActive: true, faceEmbedding: { $exists: true, $not: { $size: 0 } } });
      if (u) enrolledUsers = [u];
    } else {
      enrolledUsers = await User.find({
        isActive: true,
        faceEmbedding: { $exists: true, $not: { $size: 0 } }
      });
    }

    if (!enrolledUsers || enrolledUsers.length === 0) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'No registered face biometric profiles found in MongoDB for this account. Please register your face first.'
      });
    }

    // Evaluate matching user against strict 93.0% match threshold
    let matchingUser = null;
    let matchDetails = null;

    for (const u of enrolledUsers) {
      const cmp = faceService.compareFacialDescriptors(normalizedCurrent, u.faceEmbedding);
      
      // STRICT ZERO-TRUST 93.0% MATCH CONDITION:
      if (cmp.isMatch && cmp.confidencePercentage >= 93.0) {
        matchingUser = u;
        matchDetails = cmp;
        break; // Match confirmed
      }
    }

    // If no user satisfied strict 93.0% cutoff: REJECT ACCESS!
    if (!matchingUser || !matchDetails) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: `Face Not Recognized! Match score is ${matchDetails?.confidencePercentage || 0}%, which is below the required 93.0% threshold. Access Denied.`,
        diagnostic: {
          requiredMatchPercentage: 93.0,
          euclideanThreshold: faceService.FACE_MATCH_THRESHOLD_EUCLIDEAN,
          cosineThreshold: faceService.FACE_MATCH_THRESHOLD_COSINE
        }
      });
    }

    // Authenticated successfully! Issue JWT Token Pair
    matchingUser.lastVerification = Date.now();
    matchingUser.lastLogin = Date.now();
    await matchingUser.save();

    const tokens = tokenService.generateTokenPair(matchingUser._id);

    try {
      await Session.create({
        userId: matchingUser._id,
        token: await tokenService.hashToken(tokens.refreshToken),
        ...req.deviceInfo
      });
      await LoginHistory.create({ userId: matchingUser._id, status: 'success', ...req.deviceInfo });
    } catch (e) {
      console.error('Session logging error:', e);
    }

    const sanitizedUser = require('../utils/helpers').sanitizeUser(matchingUser);

    return resU.success(res, {
      user: sanitizedUser,
      tokens,
      faceMatch: {
        similarityScore: matchDetails.cosineSimilarity,
        euclideanDistance: matchDetails.euclideanDistance,
        confidencePercentage: matchDetails.confidencePercentage
      }
    }, `Welcome back, ${matchingUser.firstName}! Face ID verified via MongoDB with ${matchDetails.confidencePercentage}% match score.`);

  } catch (err) {
    if (err.statusCode || /face|invalid camera|payload/i.test(err.message)) {
      return res.status(err.statusCode || 400).json({
        success: false,
        authenticated: false,
        message: err.message || 'Invalid face capture. Please scan with a clear human face.'
      });
    }
    next(err);
  }
};

/**
 * Get Face Status for Current User from MongoDB
 */
exports.getFaceStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const isRegistered = !!(user && user.faceEmbedding && user.faceEmbedding.length > 0);
    return resU.success(res, { registered: isRegistered, faceVerified: !!user?.faceVerified });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Face Registration in MongoDB
 */
exports.deleteFace = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.faceEmbedding = [];
      user.faceVerified = false;
      await user.save();
    }
    return resU.success(res, null, 'Face ID template deleted from MongoDB');
  } catch (err) {
    next(err);
  }
};

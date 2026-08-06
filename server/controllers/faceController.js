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
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Webcam image base64 data is required' });
    }

    const userId = req.user._id;

    // Extract 128-dimensional facial biometric descriptor
    const descriptor = faceService.extract128DFacialDescriptor(imageBase64);

    // Save to MongoDB User record
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found in database' });
    }

    user.faceEmbedding = descriptor;
    user.faceVerified = true;
    user.verificationDate = Date.now();
    user.lastVerification = Date.now();
    await user.save();

    return resU.success(res, {
      faceVerified: true,
      vectorLength: descriptor.length,
      user: require('../utils/helpers').sanitizeUser(user)
    }, '128D Face Biometric Key registered in MongoDB successfully!');
  } catch (err) {
    next(err);
  }
};

/**
 * Recognize Face & Log In User via MongoDB Biometric Descriptors
 */
exports.recognizeAndLogin = async (req, res, next) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Webcam image base64 data is required' });
    }

    // Extract 128D descriptor from live webcam capture
    const currentDescriptor = faceService.extract128DFacialDescriptor(imageBase64);

    // Query active users with enrolled face embeddings from MongoDB
    const enrolledUsers = await User.find({
      isActive: true,
      faceEmbedding: { $exists: true, $not: { $size: 0 } }
    });

    if (!enrolledUsers || enrolledUsers.length === 0) {
      return res.status(400).json({
        success: false,
        authenticated: false,
        message: 'No registered face biometric profiles found in MongoDB. Please register your face first.'
      });
    }

    // Find best matching user using Cosine Similarity
    let bestMatchUser = null;
    let highestMatch = { similarity: 0, confidence: 0 };

    for (const u of enrolledUsers) {
      const cmp = faceService.compareFacialDescriptors(currentDescriptor, u.faceEmbedding);
      if (cmp.similarity > highestMatch.similarity) {
        highestMatch = cmp;
        bestMatchUser = u;
      }
    }

    // Enforce strict 82.0% threshold for authentication match
    if (!bestMatchUser || highestMatch.similarity < 0.82) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: `Face Mismatch! Captured face score (${highestMatch.confidence}%) does not match any registered MongoDB profile.`,
        similarityScore: highestMatch.similarity
      });
    }

    // Authenticated successfully! Issue JWT Token Pair
    bestMatchUser.lastVerification = Date.now();
    bestMatchUser.lastLogin = Date.now();
    await bestMatchUser.save();

    const tokens = tokenService.generateTokenPair(bestMatchUser._id);

    try {
      await Session.create({
        userId: bestMatchUser._id,
        token: await tokenService.hashToken(tokens.refreshToken),
        ...req.deviceInfo
      });
      await LoginHistory.create({ userId: bestMatchUser._id, status: 'success', ...req.deviceInfo });
    } catch (e) {
      console.error('Session logging error:', e);
    }

    const sanitizedUser = require('../utils/helpers').sanitizeUser(bestMatchUser);

    return resU.success(res, {
      user: sanitizedUser,
      tokens,
      faceMatch: {
        similarityScore: highestMatch.similarity,
        confidencePercentage: highestMatch.confidence
      }
    }, `Welcome back, ${bestMatchUser.firstName}! Face ID verified via MongoDB.`);

  } catch (err) {
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

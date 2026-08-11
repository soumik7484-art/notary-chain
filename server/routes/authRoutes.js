const router = require('express').Router();
const c = require('../controllers/authController');
const v = require('../middleware/validation').validate;
const s = require('../utils/validators');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { extractDeviceInfo } = require('../middleware/deviceInfo');

router.post('/signup', extractDeviceInfo, c.signup);
router.post('/login', authLimiter, extractDeviceInfo, c.login);
router.post('/google', extractDeviceInfo, c.googleAuth);
router.post('/google/init', extractDeviceInfo, c.googleAuthInit);
router.post('/google/verify-identity', extractDeviceInfo, c.googleVerifyIdentity);
router.post('/verify-email/:token', c.verifyEmail);
router.post('/forgot-password', authLimiter, v(s.forgotPasswordSchema), c.forgotPassword);
router.post('/reset-password/:token', v(s.resetPasswordSchema), c.resetPassword);
router.post('/refresh-token', c.refreshToken);
router.post('/logout', protect, c.logout);
router.get('/me', protect, c.getMe);
router.get('/sessions', protect, c.getSessions);
router.delete('/sessions/:id', protect, c.revokeSession);
router.post('/reset-auth-db', c.resetAuthDb);

module.exports = router;

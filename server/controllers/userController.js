const User = require('../models/User');
const resU = require('../utils/apiResponse');
const err = require('../utils/apiError');
const a = require('../middleware/auditLogger');

exports.getProfile = async (req, res) => resU.success(res, require('../utils/helpers').sanitizeUser(req.user));

exports.updateProfile = async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    await a.auditAction(u._id, 'update_profile', 'user', { newValues: req.body });
    resU.success(res, require('../utils/helpers').sanitizeUser(u));
  } catch (x) { next(x); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id);
    if (!(await u.comparePassword(req.body.currentPassword))) throw new err.BadRequestError('Wrong password');
    u.password = req.body.newPassword; u.refreshTokens = []; await u.save();
    await a.auditAction(u._id, 'change_password', 'user');
    resU.success(res, null, 'Password changed');
  } catch (x) { next(x); }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    await a.auditAction(req.user._id, 'delete_account', 'user');
    resU.success(res, null, 'Deactivated');
  } catch (x) { next(x); }
};

exports.getActivityTimeline = async (req, res, next) => {
  try {
    const l = await require('../models/AuditLog').find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    resU.success(res, l);
  } catch (x) { next(x); }
};

exports.getQuota = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id || req.user.id);
    if (!u) {
      return resU.success(res, {
        plan: 'FREE',
        verificationCount: 0,
        verificationLimit: 3,
        remaining: 3,
        remainingCount: 3,
        isUnlimited: false,
        isAtLimit: false,
        canVerify: true,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
    const quota = u.getQuotaInfo();
    await u.save();
    resU.success(res, quota);
  } catch (x) { next(x); }
};

exports.upgradePlan = async (req, res, next) => {
  try {
    const { plan = 'PRO' } = req.body;
    const validPlans = ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'];
    if (!validPlans.includes(plan)) throw new err.BadRequestError('Invalid plan');

    const u = await User.findById(req.user._id || req.user.id);
    if (!u) throw new err.NotFoundError('User not found');

    u.subscription = u.subscription || {};
    u.subscription.plan = plan;
    u.subscription.verificationLimit = plan === 'FREE' ? 3 : -1;
    await u.save();

    const quota = u.getQuotaInfo();
    await a.auditAction(u._id, 'upgrade_plan', 'user', { newValues: { plan } });
    resU.success(res, quota, `Plan updated to ${plan}`);
  } catch (x) { next(x); }
};


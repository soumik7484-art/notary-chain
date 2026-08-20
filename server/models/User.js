const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false },
  googleId: { type: String, sparse: true, index: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  avatar: String,
  role: { type: String, enum: ['admin', 'company', 'bank', 'notary'], default: 'company' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [{ token: String, createdAt: Date, expiresAt: Date }],
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: String,
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  
  // Face ID & Passkey Biometric Data stored in MongoDB
  faceVerified: { type: Boolean, default: false },
  faceEmbedding: [Number],
  passkey: { type: String, default: null },
  passkeyVerified: { type: Boolean, default: false },
  walletAddress: { type: String, default: null },
  walletConnected: { type: Boolean, default: false },
  verificationDate: Date,
  lastVerification: Date,

  // Firebase/User Account-Based Subscription & Quota System
  subscription: {
    plan: { type: String, enum: ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'], default: 'FREE' },
    verificationCount: { type: Number, default: 0 },
    verificationLimit: { type: Number, default: 3 },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { 
      type: Date, 
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
    }
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('profileCompleted').get(function() {
  return !!(this.firstName && this.lastName && this.phone);
});

userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Hash security passkey if modified
  if (this.isModified('passkey') && typeof this.passkey === 'string' && this.passkey.trim() !== '' && !this.passkey.startsWith('$2a$') && !this.passkey.startsWith('$2b$')) {
    this.passkey = await bcrypt.hash(this.passkey, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  if (!this.password || !candidate) return false;
  try {
    return await bcrypt.compare(candidate, this.password);
  } catch (err) {
    return false;
  }
};

userSchema.methods.comparePasskey = async function(candidate) {
  if (!this.passkey || !candidate) return false;
  try {
    return await bcrypt.compare(candidate, this.passkey);
  } catch (err) {
    return false;
  }
};

userSchema.methods.createEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.createPasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return token;
};

userSchema.methods.getQuotaInfo = function() {
  const now = new Date();
  if (!this.subscription || typeof this.subscription !== 'object') {
    this.subscription = {
      plan: 'FREE',
      verificationCount: 0,
      verificationLimit: 3,
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    };
  }
  
  // Enforce 3-doc limit and strict 24-hour reset window for Free plan
  if (this.subscription.plan === 'FREE') {
    this.subscription.verificationLimit = 3;
    const max24hMs = now.getTime() + 24 * 60 * 60 * 1000;
    const currentEndMs = new Date(this.subscription.currentPeriodEnd || 0).getTime();

    // If 24 hours have passed OR if legacy currentPeriodEnd is more than 24h away, reset/clamp to 24h
    if (!this.subscription.currentPeriodEnd || now > new Date(this.subscription.currentPeriodEnd)) {
      this.subscription.verificationCount = 0;
      this.subscription.currentPeriodStart = now;
      this.subscription.currentPeriodEnd = new Date(max24hMs);
    } else if (currentEndMs > max24hMs) {
      // Correct legacy monthly date to strictly 24 hours
      this.subscription.currentPeriodEnd = new Date(max24hMs);
    }
  } else {
    // Check rollover for paid plans
    if (this.subscription.currentPeriodEnd && now > new Date(this.subscription.currentPeriodEnd)) {
      this.subscription.verificationCount = 0;
      this.subscription.currentPeriodStart = now;
      this.subscription.currentPeriodEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  const plan = this.subscription.plan || 'FREE';
  const isUnlimited = plan !== 'FREE' || this.subscription.verificationLimit === -1;
  const limit = isUnlimited ? -1 : (this.subscription.verificationLimit || 3);
  const count = this.subscription.verificationCount || 0;
  const remaining = isUnlimited ? -1 : Math.max(0, limit - count);
  const isAtLimit = !isUnlimited && count >= limit;

  return {
    plan,
    verificationCount: count,
    verificationLimit: limit,
    remaining: isUnlimited ? 'Unlimited' : remaining,
    remainingCount: isUnlimited ? 999999 : remaining,
    isUnlimited,
    isAtLimit,
    canVerify: isUnlimited || count < limit,
    currentPeriodStart: this.subscription.currentPeriodStart,
    currentPeriodEnd: this.subscription.currentPeriodEnd
  };
};

// email is uniquely indexed in schema definition
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', userSchema);

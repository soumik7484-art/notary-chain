const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRE, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRE } = require('../config/env');

const normalizeExpiresIn = (value) => {
  if (typeof value === 'number') return value;
  if (/^\d+$/.test(String(value).trim())) return Number(value);
  return String(value).trim();
};

exports.generateAccessToken = id => jwt.sign({ id }, JWT_SECRET, { expiresIn: normalizeExpiresIn(JWT_EXPIRE) });
exports.generateRefreshToken = id => jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: normalizeExpiresIn(JWT_REFRESH_EXPIRE) });
exports.verifyAccessToken = t => jwt.verify(t, JWT_SECRET);
exports.verifyRefreshToken = t => jwt.verify(t, JWT_REFRESH_SECRET);
exports.generateTokenPair = id => ({ accessToken: this.generateAccessToken(id), refreshToken: this.generateRefreshToken(id) });
exports.hashToken = async t => await bcrypt.hash(t, 10);

exports.revokeRefreshToken = async (u, t) => {
  u.refreshTokens = u.refreshTokens.filter(rt => rt.token !== t);
  await u.save();
};

exports.revokeAllRefreshTokens = async u => {
  u.refreshTokens = [];
  await u.save();
};

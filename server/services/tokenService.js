const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const getSecret = () => process.env.JWT_SECRET || 'notarychain-dev-jwt-secret-key-2024-change-in-production';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'notarychain-dev-jwt-refresh-secret-2024';
const getExpire = () => (process.env.JWT_EXPIRE && process.env.JWT_EXPIRE.trim() !== '' ? process.env.JWT_EXPIRE : '15m');
const getRefreshExpire = () => (process.env.JWT_REFRESH_EXPIRE && process.env.JWT_REFRESH_EXPIRE.trim() !== '' ? process.env.JWT_REFRESH_EXPIRE : '7d');

exports.generateAccessToken = id => jwt.sign({ id }, getSecret(), { expiresIn: getExpire() });
exports.generateRefreshToken = id => jwt.sign({ id }, getRefreshSecret(), { expiresIn: getRefreshExpire() });
exports.verifyAccessToken = t => jwt.verify(t, getSecret());
exports.verifyRefreshToken = t => jwt.verify(t, getRefreshSecret());
exports.generateTokenPair = id => ({ accessToken: exports.generateAccessToken(id), refreshToken: exports.generateRefreshToken(id) });
exports.hashToken = async t => await bcrypt.hash(t, 10);

exports.revokeRefreshToken = async (u, t) => {
  u.refreshTokens = u.refreshTokens.filter(rt => rt.token !== t);
  await u.save();
};

exports.revokeAllRefreshTokens = async u => {
  u.refreshTokens = [];
  await u.save();
};

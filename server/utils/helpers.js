const crypto = require('crypto');
const mongoose = require('mongoose');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

exports.generateUniqueId = () => uuidv4();
exports.hashSHA256 = d => crypto.createHash('sha256').update(d).digest('hex');
exports.generateRandomToken = (b = 32) => crypto.randomBytes(b).toString('hex');
exports.sanitizeUser = u => {
  const o = u.toObject ? u.toObject() : { ...u };
  delete o.password; delete o.refreshTokens; delete o.emailVerificationToken; delete o.passwordResetToken;
  // Always provide a `name` field from firstName + lastName for frontend display
  if (!o.name && (o.firstName || o.lastName)) {
    o.name = `${o.firstName || ''} ${o.lastName || ''}`.trim() || 'User';
  }
  return o;
};
exports.calculateFileHash = p => new Promise((res, rej) => {
  const h = crypto.createHash('sha256');
  const s = fs.createReadStream(p);
  s.on('data', d => h.update(d));
  s.on('end', () => res(h.digest('hex')));
  s.on('error', rej);
});
exports.formatBytes = b => {
  if (!b) return '0 Bytes';
  const k = 1024, s = ['Bytes', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + s[i];
};
exports.isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);
exports.getPaginationParams = q => ({
  page: parseInt(q.page) || 1, limit: parseInt(q.limit) || 10, sort: q.sort || 'createdAt', order: q.order === 'asc' ? 1 : -1
});
exports.buildFilterQuery = (q, a) => {
  let f = {};
  a.forEach(k => { if (q[k]) f[k] = q[k]; });
  return f;
};

const crypto = require('crypto');
const env = require('../config/env');
const ALGO = 'aes-256-gcm';

function getEncryptionKeyBuffer() {
  const rawKey = process.env.ENCRYPTION_KEY || env.ENCRYPTION_KEY || 'notarychain-default-encryption-key-32bytes!';
  return crypto.createHash('sha256').update(String(rawKey)).digest();
}

exports.encrypt = (text) => {
  if (!text) return '';
  const key = getEncryptionKeyBuffer();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
};

exports.decrypt = (encryptedText) => {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  try {
    const key = getEncryptionKeyBuffer();
    const [ivHex, encrypted, authTagHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return encryptedText;
  }
};

exports.hashData = (data) => {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
};

exports.generateKey = () => crypto.randomBytes(32).toString('hex');


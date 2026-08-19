const encryptionService = require('../services/encryptionService');
const faceService = require('../services/faceRecognitionService');
const tokenService = require('../services/tokenService');

describe('Security & Encryption Unit Tests', () => {
  test('AES-256-GCM should encrypt and decrypt data accurately', () => {
    const secretMessage = 'Confidential Notarized Affidavit Document';
    const encrypted = encryptionService.encrypt(secretMessage);

    expect(encrypted).toBeDefined();
    expect(encrypted).toContain(':');

    const decrypted = encryptionService.decrypt(encrypted);
    expect(decrypted).toBe(secretMessage);
  });

  test('SHA-256 Hash Generation should be deterministic', () => {
    const content = 'NotaryChain-Document-Buffer-SHA256';
    const hash1 = encryptionService.hashData(content);
    const hash2 = encryptionService.hashData(content);

    expect(hash1.length).toBe(64);
    expect(hash1).toBe(hash2);
  });

  test('JWT Token Generation and Verification', () => {
    const userId = '507f1f77bcf86cd799439011';
    const tokenPair = tokenService.generateTokenPair(userId);

    expect(tokenPair.accessToken).toBeDefined();
    expect(tokenPair.refreshToken).toBeDefined();

    const decoded = tokenService.verifyAccessToken(tokenPair.accessToken);
    expect(decoded.id.toString()).toBe(userId);
  });

  test('128D Facial Descriptor extraction & similarity matching', () => {
    const mockImageA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const descA = faceService.extract128DFacialDescriptor(mockImageA);
    const descB = faceService.extract128DFacialDescriptor(mockImageA);

    expect(descA.length).toBe(128);
    const cmp = faceService.compareFacialDescriptors(descA, descB);

    expect(cmp.similarity).toBeGreaterThan(0.99);
    expect(cmp.confidence).toBeGreaterThan(95.0);
  });
});

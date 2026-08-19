const FraudDetectionService = require('../services/ai/fraudDetectionService');
const blockchainService = require('../services/blockchainService');

describe('Document Verification & Fraud Detection Tests', () => {
  test('FraudDetectionService should evaluate clean documents as low risk', async () => {
    const fraudService = new FraudDetectionService();
    const cleanBuffer = Buffer.from('Standard commercial service agreement between Party A and Party B.');
    const report = await fraudService.analyzeDocument(null, cleanBuffer, 'Standard_Agreement.pdf');

    expect(report.results).toBeDefined();
    expect(report.results.riskLevel).toBe('low');
    expect(report.results.isFraudulent).toBe(false);
    expect(report.results.riskScore).toBeLessThan(35);
  });

  test('FraudDetectionService should flag documents with suspicious keywords as high risk', async () => {
    const fraudService = new FraudDetectionService();
    const report = await fraudService.analyzeDocument(null, null, 'FAKE_COUNTERFEIT_TITLE_DEED.pdf');

    expect(report.results).toBeDefined();
    expect(report.results.riskLevel).toBe('high');
    expect(report.results.isFraudulent).toBe(true);
    expect(report.results.anomalies.length).toBeGreaterThan(0);
  });

  test('Blockchain Service SHA-256 and bytes32 helpers', () => {
    const rawData = 'NotaryChain-Proof-Of-Existence';
    const hash = blockchainService.constructor.hashSHA256(rawData);
    expect(hash.length).toBe(64);

    const bytes32 = blockchainService.constructor.toBytes32(hash);
    expect(bytes32.startsWith('0x')).toBe(true);
    expect(bytes32.length).toBe(66);
  });
});

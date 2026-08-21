'use strict';

/**
 * trustScoreEngine.js
 * 
 * Deterministic, transparent Trust Score Calculator (0 - 100).
 * Calculates scores using transparent mathematical deductions based on verified
 * legal completeness, contradictory provisions, signature execution, and biometric standards.
 */

/**
 * Computes Trust Score and structured risk level.
 * 
 * @param {Array<{ code: string, severity: string, impact: number, explanation: string, source_page?: number }>} conflicts
 * @param {object} entities - Extracted document entities
 * @param {string} classification - Document category
 * @param {number} extractionConfidence - Confidence of text extraction (0 - 100)
 * @returns {{
 *   trust_score: number,
 *   risk_level: 'LOW'|'MEDIUM'|'HIGH'|'UNDETERMINED',
 *   risk_factors: Array<{ code: string, severity: string, impact: number, explanation: string, source_page?: number }>,
 *   base_score: number,
 *   total_deductions: number
 * }}
 */
function calculateTrustScore(conflicts = [], entities = {}, classification = '', extractionConfidence = 100) {
  // If extraction completely failed, do not assess false legal risk
  if (extractionConfidence < 20) {
    return {
      trust_score: 0,
      risk_level: 'UNDETERMINED',
      risk_factors: [
        {
          code: 'EXTRACTION_FAILED',
          severity: 'HIGH',
          impact: 0,
          explanation: 'The system could not reliably extract document text. Please run OCR or provide a legible file.'
        }
      ],
      base_score: 0,
      total_deductions: 0
    };
  }

  let baseScore = 100;
  let totalDeductions = 0;
  const riskFactors = [...conflicts];

  for (const factor of riskFactors) {
    const impact = Math.abs(factor.impact || 10);
    totalDeductions += impact;
  }

  const finalScore = Math.max(10, Math.min(98, baseScore - totalDeductions));

  let riskLevel = 'LOW';
  if (finalScore < 55) {
    riskLevel = 'HIGH';
  } else if (finalScore < 85) {
    riskLevel = 'MEDIUM';
  }

  return {
    trust_score: finalScore,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    base_score: baseScore,
    total_deductions: totalDeductions
  };
}

module.exports = {
  calculateTrustScore
};

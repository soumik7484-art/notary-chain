'use strict';

/**
 * contradictionService.js
 * 
 * Deterministic Contradiction and Conflict Detection Engine.
 * Detects date conflicts, payment term inconsistencies, blank signature blocks,
 * and biometric threshold failures before invoking the LLM.
 */

/**
 * Runs deterministic contradiction and risk checks across extracted entities and document text.
 * 
 * @param {object} entities - Extracted entities (parties, signatories, dates, monetaryValues, clauses)
 * @param {string} fullText - Full visible document text
 * @param {string} classification - Document classification category
 * @returns {Array<{ code: string, severity: 'HIGH'|'MEDIUM'|'LOW', impact: number, explanation: string, source_page?: number }>}
 */
function detectContradictions(entities = {}, fullText = '', classification = '') {
  const conflicts = [];
  const lowerText = fullText.toLowerCase();

  // 1. DATE_CONFLICT: Check for conflicting effective dates vs schedule dates
  const effDateObj = entities.dates?.find(d => d.label === 'Effective Date');
  const schedDateObj = entities.dates?.find(d => d.label === 'Schedule Date');

  if (effDateObj && schedDateObj && effDateObj.normalized && schedDateObj.normalized) {
    if (effDateObj.normalized !== schedDateObj.normalized) {
      conflicts.push({
        code: 'DATE_CONFLICT',
        severity: 'MEDIUM',
        impact: -15,
        explanation: `Contradictory dates detected: Master Agreement Effective Date (${effDateObj.raw} [${effDateObj.normalized}]) conflicts with Schedule Commencement Date (${schedDateObj.raw} [${schedDateObj.normalized}]).`,
        source_page: schedDateObj.source_page || 1
      });
    }
  }

  // 2. PAYMENT_TERM_CONFLICT: Advance vs Arrears billing
  const hasAdvance = lowerText.includes('in advance') || lowerText.includes('billed in advance') || lowerText.includes('payable in advance');
  const hasArrears = lowerText.includes('in arrears') || lowerText.includes('billed in arrears') || lowerText.includes('payable in arrears');

  if (hasAdvance && hasArrears) {
    conflicts.push({
      code: 'PAYMENT_TERM_CONFLICT',
      severity: 'MEDIUM',
      impact: -15,
      explanation: 'Contradictory payment terms detected: Section specifies billing in advance while Schedule specifies billing in arrears.',
      source_page: 1
    });
  }

  // 3. BIOMETRIC_THRESHOLD_FAILED & IDENTITY_MISMATCH (Identity Verification Reports)
  if (classification.includes('Identity') || lowerText.includes('biometric') || lowerText.includes('facenet')) {
    // Extract biometric similarity score e.g. "94.7%" or "94.7"
    const scoreMatch = fullText.match(/(?:biometric|similarity|score|confidence|match)[^0-9\n\r]*?([\d.]+)\s*%/i) ||
                       fullText.match(/([\d.]+)\s*%\s*(?:match|similarity)/i);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      if (!isNaN(score)) {
        if (score < 95.0) {
          conflicts.push({
            code: 'BIOMETRIC_THRESHOLD_FAILED',
            severity: 'HIGH',
            impact: -30,
            explanation: `Biometric verification failed: Match score ${score}% is below the required strict 95.0% threshold (SSD MobileNet + 128D FaceNet standard).`,
            source_page: 1
          });
        }
      }
    }

    // Name mismatch check
    if (lowerText.includes('name mismatch') || (lowerText.includes('declared name') && lowerText.includes('extracted name') && lowerText.includes('mismatch'))) {
      conflicts.push({
        code: 'IDENTITY_MISMATCH',
        severity: 'HIGH',
        impact: -25,
        explanation: 'Identity verification discrepancy: Declared full name does not match ID document extracted name.',
        source_page: 1
      });
    }

    // DOB mismatch check
    if (lowerText.includes('dob mismatch') || lowerText.includes('date of birth mismatch') || lowerText.includes('birth date discrepancy')) {
      conflicts.push({
        code: 'IDENTITY_MISMATCH',
        severity: 'HIGH',
        impact: -25,
        explanation: 'Identity verification discrepancy: Date of birth in applicant record does not match government credential.',
        source_page: 1
      });
    }
  }

  // 4. UNEXECUTED_SIGNATURE & MISSING_SIGNATURE_DATE
  const hasBlankSig = lowerText.includes('[signature]') ||
                      lowerText.includes('__________') ||
                      lowerText.includes('blank signature') ||
                      lowerText.includes('unsigned') ||
                      lowerText.includes('pending signature') ||
                      (lowerText.includes('signature:') && lowerText.includes('date: [blank]'));

  if (hasBlankSig) {
    conflicts.push({
      code: 'UNEXECUTED_SIGNATURE',
      severity: 'HIGH',
      impact: -20,
      explanation: 'Unexecuted signature block: One or more signature fields or client execution lines remain blank or unsigned.',
      source_page: entities.signatories?.[0]?.source_page || 1
    });
  }

  // Missing Client Signature Date
  if (lowerText.includes('missing client signature date') || (lowerText.includes('client signature') && lowerText.includes('date: _____'))) {
    conflicts.push({
      code: 'MISSING_SIGNATURE_DATE',
      severity: 'MEDIUM',
      impact: -10,
      explanation: 'Missing execution date: Counterparty signature block is missing the required execution date timestamp.',
      source_page: 1
    });
  }

  // 5. MISSING_CONTRACTING_PARTY
  if (classification.includes('NDA') || classification.includes('MSA') || classification.includes('Contract')) {
    if (!entities.parties || entities.parties.length < 2) {
      if (!lowerText.includes('between') && !lowerText.includes('party a') && !lowerText.includes('party b')) {
        conflicts.push({
          code: 'MISSING_CONTRACTING_PARTY',
          severity: 'HIGH',
          impact: -30,
          explanation: 'Missing counterparty: The document does not clearly identify both bilateral contracting parties.',
          source_page: 1
        });
      }
    }
  }

  // 6. EFFECTIVE_DATE_AMBIGUITY
  if (lowerText.includes('effective date: tbd') || lowerText.includes('effective date: upon signing') || lowerText.includes('date unstated')) {
    conflicts.push({
      code: 'UNCLEAR_EFFECTIVE_DATE',
      severity: 'LOW',
      impact: -10,
      explanation: 'Ambiguous effective date: The commencement date is unstated or marked as TBD, creating legal enforceability ambiguity.',
      source_page: 1
    });
  }

  return conflicts;
}

module.exports = {
  detectContradictions
};

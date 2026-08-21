/**
 * Deterministic Trust Score & Risk Calculation Engine for NotaryChain
 * Implements authoritative weighted deductions outside of LLM hallucinations.
 */

const DEDUCTION_RULES = {
  MISSING_PARTIES: {
    code: 'MISSING_PARTIES',
    severity: 'HIGH',
    impact: -30,
    explanation: 'One or more essential contracting parties could not be identified in the document body.'
  },
  MISSING_SIGNATURES: {
    code: 'MISSING_SIGNATURES',
    severity: 'HIGH',
    impact: -20,
    explanation: 'Document contains unexecuted, blank, or missing signatory blocks.'
  },
  CONTRADICTORY_TERMS: {
    code: 'CONTRADICTORY_TERMS',
    severity: 'HIGH',
    impact: -15,
    explanation: 'Internal contradiction detected (e.g. conflicting effective dates or advance vs. arrears billing).'
  },
  IDENTITY_MISMATCH: {
    code: 'IDENTITY_MISMATCH',
    severity: 'CRITICAL',
    impact: -25,
    explanation: 'Identity verification failed: name or date of birth mismatch detected across records.'
  },
  BIOMETRIC_FAILURE: {
    code: 'BIOMETRIC_FAILURE',
    severity: 'CRITICAL',
    impact: -30,
    explanation: 'Biometric face match failed minimum 95.0% threshold requirement.'
  },
  SUSPICIOUS_PAYMENT: {
    code: 'SUSPICIOUS_PAYMENT',
    severity: 'MEDIUM',
    impact: -15,
    explanation: 'Suspicious payment instruction detected (e.g. urgent routing changes or mismatched beneficiary details).'
  },
  MISSING_ESSENTIAL_CLAUSE: {
    code: 'MISSING_ESSENTIAL_CLAUSE',
    severity: 'MEDIUM',
    impact: -10,
    explanation: 'Missing essential clause (e.g. governing law, liability cap, or dispute resolution mechanism).'
  },
  AMBIGUOUS_DATE: {
    code: 'AMBIGUOUS_DATE',
    severity: 'LOW',
    impact: -10,
    explanation: 'Effective date or term length is ambiguous or relies on unverified external milestones.'
  }
};

/**
 * Compute deterministic Trust Score and structured risk factors
 */
function calculateDeterministicTrustScore({
  parties = [],
  signatories = [],
  contradictions = [],
  missing_information = [],
  risk_flags = [],
  identity_mismatch = false,
  biometric_score = null,
  category = 'contract',
  legal_applicability = null
}) {
  const cat = (category || '').toLowerCase();
  const isAgreement = ['contract', 'agreement', 'nda', 'msa', 'amendment'].some(k => cat.includes(k));
  const isFinancial = ['invoice', 'financial', 'receipt', 'billing'].some(k => cat.includes(k));
  const isIdentity = ['identity', 'kyc', 'passport', 'id', 'verification'].some(k => cat.includes(k));

  let score = 100;
  const appliedFactors = [];

  // 1. Missing Parties check (for bilateral agreements)
  if (isAgreement) {
    if (parties.length < 2) {
      score += DEDUCTION_RULES.MISSING_PARTIES.impact;
      appliedFactors.push(DEDUCTION_RULES.MISSING_PARTIES);
    }
  } else if (!isFinancial && !isIdentity && parties.length === 0) {
    // For general documents with no identified publisher/organization
    score -= 8;
  }

  // 2. Missing Signatures
  if (isAgreement && signatories.length === 0) {
    score += DEDUCTION_RULES.MISSING_SIGNATURES.impact;
    appliedFactors.push(DEDUCTION_RULES.MISSING_SIGNATURES);
  }

  // 3. Contradictions (e.g. conflicting dates, billing terms)
  if (contradictions.length > 0) {
    for (const c of contradictions) {
      const deduction = {
        code: 'CONTRADICTORY_TERMS',
        severity: 'HIGH',
        impact: -15,
        explanation: typeof c === 'string' ? c : (c.explanation || 'Internal contractual contradiction detected.')
      };
      score += deduction.impact;
      appliedFactors.push(deduction);
    }
  }

  // 4. Identity / Biometric Checks
  if (identity_mismatch) {
    score += DEDUCTION_RULES.IDENTITY_MISMATCH.impact;
    appliedFactors.push(DEDUCTION_RULES.IDENTITY_MISMATCH);
  }

  if (biometric_score !== null && biometric_score !== undefined) {
    // Strict 95.0% threshold - never round up 94.7%
    if (biometric_score < 95.0) {
      score += DEDUCTION_RULES.BIOMETRIC_FAILURE.impact;
      appliedFactors.push({
        ...DEDUCTION_RULES.BIOMETRIC_FAILURE,
        explanation: `Biometric face match of ${biometric_score}% is below the mandatory 95.0% threshold.`
      });
    }
  }

  // 5. Additional Risk Flags & Suspicious instructions
  for (const rf of risk_flags) {
    const flagText = (typeof rf === 'string' ? rf : (rf.flag || rf.explanation || '')).toLowerCase();
    if (flagText.includes('suspicious payment') || flagText.includes('wire transfer') || flagText.includes('offshore') || flagText.includes('payment instruction')) {
      if (!appliedFactors.some(f => f.code === 'SUSPICIOUS_PAYMENT')) {
        score += DEDUCTION_RULES.SUSPICIOUS_PAYMENT.impact;
        appliedFactors.push(DEDUCTION_RULES.SUSPICIOUS_PAYMENT);
      }
    } else if (flagText.includes('ambiguous date') || flagText.includes('missing effective date')) {
      if (!appliedFactors.some(f => f.code === 'AMBIGUOUS_DATE')) {
        score += DEDUCTION_RULES.AMBIGUOUS_DATE.impact;
        appliedFactors.push(DEDUCTION_RULES.AMBIGUOUS_DATE);
      }
    }
  }

  // 6. Missing information
  if (Array.isArray(missing_information) && missing_information.length > 0) {
    score -= Math.min(15, missing_information.length * 5);
  }

  // Clamp trust score between 10 and 98
  const trustScore = Math.max(10, Math.min(98, score));

  // Determine Risk Level
  let riskLevel = 'LOW';
  if (trustScore < 70 || appliedFactors.some(f => f.severity === 'CRITICAL')) {
    riskLevel = 'HIGH';
  } else if (trustScore < 90 || appliedFactors.some(f => f.severity === 'HIGH')) {
    riskLevel = 'MEDIUM';
  }

  return {
    legal_applicability: 'APPLICABLE',
    trust_score: trustScore,
    risk_level: riskLevel,
    risk_factors: appliedFactors
  };
}

module.exports = {
  DEDUCTION_RULES,
  calculateDeterministicTrustScore
};

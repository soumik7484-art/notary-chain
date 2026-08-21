'use strict';

/**
 * documentClassificationService.js
 * 
 * Classifies document type strictly from visible document content.
 * Guarantees that internal PDF technical metadata (e.g. ReportLab producer, SSL.com certificate)
 * is never used to determine legal classification.
 */

const CATEGORIES = {
  NDA: 'Mutual NDA',
  MSA: 'Master Services Agreement',
  INVOICE: 'Commercial Invoice',
  ID_VERIFICATION: 'Identity Verification Report',
  AMENDMENT: 'Contract Amendment',
  EMPLOYMENT: 'Employment Agreement',
  PURCHASE_ORDER: 'Purchase Order',
  LEGAL_NOTICE: 'Legal Notice',
  CERTIFICATE: 'Certificate of Notarization',
  CONTRACT: 'Commercial Contract',
  OTHER: 'General Legal Document',
  UNKNOWN: 'Unknown Document'
};

/**
 * Classifies document content into a standardized category.
 * @param {string} visibleText - Extracted visible document text
 * @param {string} declaredTitle - Uploaded title or file name
 * @param {string} declaredCategory - User-selected category
 * @returns {{ category: string, subCategory: string, confidence: number }}
 */
function classifyDocument(visibleText, declaredTitle = '', declaredCategory = '') {
  if (!visibleText || visibleText.trim().length < 15) {
    return {
      category: CATEGORIES.UNKNOWN,
      subCategory: declaredCategory || 'unclassified',
      confidence: 0
    };
  }

  const text = visibleText.toLowerCase();
  const title = (declaredTitle || '').toLowerCase();

  // 1. Identity Verification Report (biometric face matching, SSD MobileNet, 128D FaceNet, liveness)
  if (
    text.includes('biometric verification') ||
    text.includes('face verification') ||
    text.includes('facenet') ||
    text.includes('identity verification report') ||
    text.includes('liveness detection') ||
    text.includes('biometric similarity') ||
    (text.includes('facial embedding') && text.includes('threshold'))
  ) {
    return { category: CATEGORIES.ID_VERIFICATION, subCategory: 'Identity Verification', confidence: 98 };
  }

  // 2. Contract Amendment / Addendum / Schedule Amendment
  if (
    text.includes('contract amendment') ||
    text.includes('amendment to') ||
    text.includes('first amendment') ||
    text.includes('second amendment') ||
    text.includes('amendment agreement') ||
    (text.includes('amends the') && text.includes('original agreement')) ||
    title.includes('amendment')
  ) {
    return { category: CATEGORIES.AMENDMENT, subCategory: 'Contract Amendment', confidence: 95 };
  }

  // 3. Mutual NDA / Non-Disclosure Agreement
  if (
    text.includes('non-disclosure agreement') ||
    text.includes('nondisclosure agreement') ||
    text.includes('mutual nda') ||
    text.includes('confidentiality agreement') ||
    (text.includes('confidential information') && (text.includes('mutual') || text.includes('disclosing party'))) ||
    title.includes('nda')
  ) {
    return { category: CATEGORIES.NDA, subCategory: 'Mutual Non-Disclosure Agreement', confidence: 96 };
  }

  // 4. Master Services Agreement (MSA)
  if (
    text.includes('master services agreement') ||
    text.includes('master service agreement') ||
    text.includes('msa') ||
    (text.includes('statement of work') && text.includes('services')) ||
    title.includes('msa')
  ) {
    return { category: CATEGORIES.MSA, subCategory: 'Master Services Agreement', confidence: 95 };
  }

  // 5. Commercial Invoice / Tax Invoice / Billing Statement
  if (
    text.includes('commercial invoice') ||
    text.includes('tax invoice') ||
    text.includes('invoice no') ||
    text.includes('invoice number') ||
    text.includes('bill to:') ||
    text.includes('amount due:') ||
    text.includes('total due:') ||
    (text.includes('invoice') && text.includes('payment terms')) ||
    title.includes('invoice')
  ) {
    return { category: CATEGORIES.INVOICE, subCategory: 'Commercial Invoice', confidence: 95 };
  }

  // 6. Employment Agreement / Offer Letter
  if (
    text.includes('employment agreement') ||
    text.includes('employment contract') ||
    text.includes('offer letter') ||
    (text.includes('employer') && text.includes('employee') && text.includes('compensation'))
  ) {
    return { category: CATEGORIES.EMPLOYMENT, subCategory: 'Employment Agreement', confidence: 92 };
  }

  // 7. Purchase Order (PO)
  if (text.includes('purchase order') || text.includes('po number') || text.includes('order confirmation')) {
    return { category: CATEGORIES.PURCHASE_ORDER, subCategory: 'Purchase Order', confidence: 90 };
  }

  // 8. Legal Notice
  if (text.includes('legal notice') || text.includes('notice of breach') || text.includes('cease and desist')) {
    return { category: CATEGORIES.LEGAL_NOTICE, subCategory: 'Legal Notice', confidence: 90 };
  }

  // 9. Standard Commercial Contract
  if (text.includes('agreement') && (text.includes('by and between') || text.includes('parties'))) {
    return { category: CATEGORIES.CONTRACT, subCategory: 'Commercial Contract', confidence: 85 };
  }

  return {
    category: CATEGORIES.OTHER,
    subCategory: declaredCategory ? declaredCategory.toUpperCase() : 'General Legal Document',
    confidence: 75
  };
}

module.exports = {
  CATEGORIES,
  classifyDocument
};

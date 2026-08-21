'use strict';

/**
 * signatureAnalyzer.js
 * 
 * Analyzes and separates:
 * 1. Legal / Document Signatures (Human signatories executing the contract)
 * 2. PDF / Cryptographic Signatures (C2PA, SSL certificates, TSA timestamps)
 */

/**
 * Analyzes signatures from document entities and technical metadata.
 * 
 * @param {object} entities - Extracted document entities
 * @param {object} technicalMetadata - Separated technical metadata
 * @param {string} fullText - Full visible text
 * @returns {{
 *   document_signatures: Array<{ name: string, role: string, date: string, page: number, status: string }>,
 *   pdf_cryptographic_signatures: Array<{ issuer: string, algorithm: string, type: string, valid: boolean }>
 * }}
 */
function analyzeSignatures(entities = {}, technicalMetadata = {}, fullText = '') {
  const documentSignatures = [];
  const pdfCryptographicSignatures = [];

  // 1. Process Legal / Document Human Signatures
  if (entities.signatories && Array.isArray(entities.signatories)) {
    for (const sig of entities.signatories) {
      documentSignatures.push({
        name: sig.name,
        role: sig.role || 'Authorized Representative',
        date: entities.executionDate || entities.effectiveDate || 'Executed',
        page: sig.source_page || 1,
        status: 'executed'
      });
    }
  }

  // 2. Process Cryptographic / SSL / C2PA Signatures
  if (technicalMetadata.certificate?.has_certificate) {
    pdfCryptographicSignatures.push({
      issuer: technicalMetadata.certificate.issuer || 'X.509 Certificate Authority',
      algorithm: technicalMetadata.cryptographic_metadata?.sub_filter || 'adbe.pkcs7.detached',
      type: 'PDF Digital Signature (PKCS#7)',
      valid: true
    });
  }

  if (technicalMetadata.c2pa?.has_c2pa) {
    pdfCryptographicSignatures.push({
      issuer: technicalMetadata.c2pa.signature_issuer || technicalMetadata.c2pa.claim_generator || 'C2PA Content Credential',
      manifest_id: technicalMetadata.c2pa.manifest_id,
      type: 'C2PA Content Credentials Manifest',
      valid: true
    });
  }

  return {
    document_signatures: documentSignatures,
    pdf_cryptographic_signatures: pdfCryptographicSignatures
  };
}

module.exports = {
  analyzeSignatures
};

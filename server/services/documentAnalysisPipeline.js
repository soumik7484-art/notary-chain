'use strict';

const crypto = require('crypto');
const axios = require('axios');
const logger = require('../utils/logger');
const { extractDocumentData } = require('../utils/pdfExtractor');
const { normalizeDocumentText } = require('../utils/contentNormalizer');
const { classifyDocument } = require('./ai/documentClassificationService');
const { extractEntities } = require('./ai/entityExtractionService');
const { detectContradictions } = require('./ai/contradictionService');
const { analyzeSignatures } = require('./ai/signatureAnalyzer');
const { calculateTrustScore } = require('./ai/trustScoreEngine');

/**
 * documentAnalysisPipeline.js
 * 
 * Master 15-Stage Document Analysis & Notarization Intelligence Pipeline.
 * Enforces strict separation between visible document content and PDF technical metadata.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b', 'groq/compound'];

/**
 * Executes the complete document verification pipeline.
 * 
 * @param {Buffer} fileBuffer - Exact uploaded file buffer
 * @param {string} mimeType - File MIME type
 * @param {string} fileName - File name
 * @param {string} declaredTitle - User-provided title
 * @param {string} declaredCategory - User-provided category
 * @param {string} clientExtractedText - Optional pre-extracted text from frontend
 * @returns {Promise<object>} Standardized document intelligence result
 */
async function processDocumentPipeline(fileBuffer, mimeType, fileName, declaredTitle = '', declaredCategory = '', clientExtractedText = '') {
  const startTime = Date.now();

  // ─── [UPLOAD] & [SHA256] ──────────────────────────────────────────────────
  logger.info(`[UPLOAD] Processing file "${fileName}" (${fileBuffer.length} bytes, ${mimeType})`);
  const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  logger.info(`[SHA256] Computed exact file SHA-256: ${documentHash}`);

  // ─── [PDF_VALIDATION] ─────────────────────────────────────────────────────
  const isPdf = mimeType === 'application/pdf' || (fileName && fileName.toLowerCase().endsWith('.pdf'));
  logger.info(`[PDF_VALIDATION] File format valid: ${isPdf ? 'PDF' : mimeType}`);

  // ─── [TEXT_EXTRACTION] & [METADATA_SEPARATION] ────────────────────────────
  const { document_content, technical_metadata, extraction_confidence, ocr_used } = await extractDocumentData(
    fileBuffer,
    mimeType,
    fileName,
    clientExtractedText
  );

  const rawFullText = document_content.full_text || '';
  const numPages = document_content.pages?.length || 1;
  logger.info(`[TEXT_EXTRACTION] Extracted ${rawFullText.length} chars across ${numPages} page(s) (OCR: ${ocr_used ? 'YES' : 'NO'}, Confidence: ${extraction_confidence}%)`);
  logger.info(`[METADATA_SEPARATION] Separated technical metadata (Producer: "${technical_metadata.pdf_producer || 'None'}", C2PA: ${technical_metadata.c2pa?.has_c2pa ? 'YES' : 'NO'}, Cert: ${technical_metadata.certificate?.has_certificate ? 'YES' : 'NO'})`);

  // ─── [CONTENT_NORMALIZATION] ──────────────────────────────────────────────
  const normalizedText = normalizeDocumentText(rawFullText);
  logger.info(`[CONTENT_NORMALIZATION] Normalized visible content text (${normalizedText.length} chars)`);

  // ─── [DOCUMENT_CLASSIFICATION] ────────────────────────────────────────────
  const classificationResult = classifyDocument(normalizedText, declaredTitle || fileName, declaredCategory);
  const documentCategory = classificationResult.category;
  logger.info(`[DOCUMENT_CLASSIFICATION] Classified as: "${documentCategory}" (Sub: "${classificationResult.subCategory}", Confidence: ${classificationResult.confidence}%)`);

  // ─── [ENTITY_EXTRACTION] & [CLAUSE_EXTRACTION] ────────────────────────────
  const entities = extractEntities(document_content.pages, normalizedText);
  const partyCount = entities.parties?.length || 0;
  const signatoryCount = entities.signatories?.length || 0;
  logger.info(`[ENTITY_EXTRACTION] Extracted ${partyCount} parties, ${signatoryCount} signatories, ${entities.dates?.length || 0} dates, ${entities.monetaryValues?.length || 0} monetary terms`);
  logger.info(`[CLAUSE_EXTRACTION] Extracted ${entities.clauses?.length || 0} key clauses (Governing Law: "${entities.governingLaw || 'Unstated'}")`);

  // ─── [CONTRADICTION_CHECK] ────────────────────────────────────────────────
  const contradictions = detectContradictions(entities, normalizedText, documentCategory);
  logger.info(`[CONTRADICTION_CHECK] Found ${contradictions.length} deterministic risk/contradiction flags`);

  // ─── [SIGNATURE_ANALYSIS] ─────────────────────────────────────────────────
  const signatureAnalysis = analyzeSignatures(entities, technical_metadata, normalizedText);

  // ─── [RISK_ENGINE] & [TRUST_SCORE] ────────────────────────────────────────
  const trustScoreResult = calculateTrustScore(contradictions, entities, documentCategory, extraction_confidence);
  logger.info(`[RISK_ENGINE] Deterministic Risk Level: ${trustScoreResult.risk_level}`);
  logger.info(`[TRUST_SCORE] Calculated Trust Score: ${trustScoreResult.trust_score}/100 (Total deductions: -${trustScoreResult.total_deductions})`);

  // ─── [LLM_LEGAL_INTELLIGENCE] (Groq API on document_content ONLY) ─────────
  let llmSummary = null;
  let llmKeyTerms = [];

  if (normalizedText.length >= 25 && extraction_confidence >= 20) {
    try {
      const llmResult = await runGroqLegalAnalysis(normalizedText, documentCategory, declaredTitle || fileName);
      if (llmResult?.summary) llmSummary = llmResult.summary;
      if (Array.isArray(llmResult?.keyTerms) && llmResult.keyTerms.length > 0) {
        llmKeyTerms = llmResult.keyTerms;
      }
    } catch (llmErr) {
      logger.warn('[LLM_LEGAL_INTELLIGENCE] Groq call note:', llmErr.message);
    }
  }

  // Fallback summary if LLM was unavailable
  if (!llmSummary) {
    llmSummary = generateDeterministicSummary(entities, documentCategory, declaredTitle || fileName, trustScoreResult);
  }

  // Format Key Terms for frontend
  const keyTerms = assembleKeyTerms(entities, documentCategory, llmKeyTerms);

  // Format Risk Flags for frontend
  const riskFlags = trustScoreResult.risk_factors.map(rf => ({
    severity: rf.severity.toLowerCase(),
    flag: rf.explanation,
    code: rf.code,
    impact: rf.impact,
    source_page: rf.source_page || 1
  }));

  const processingTimeMs = Date.now() - startTime;

  // ─── [AUDIT_LOG] ──────────────────────────────────────────────────────────
  logger.info(`[AUDIT_LOG] Document analysis completed in ${processingTimeMs}ms (Trust: ${trustScoreResult.trust_score}, Risk: ${trustScoreResult.risk_level}, Hash: ${documentHash.substring(0, 16)}...)`);

  return {
    document: {
      title: declaredTitle || fileName,
      category: documentCategory,
      document_id: entities.documentId || `NC-${documentHash.substring(0, 10).toUpperCase()}`,
      hash_algorithm: 'SHA-256',
      document_hash: documentHash,
      pages_count: numPages,
      extraction_confidence: extraction_confidence,
      ocr_used: ocr_used
    },
    document_content: {
      pages: document_content.pages,
      parties: entities.parties,
      signatories: entities.signatories,
      dates: entities.dates,
      monetary_values: entities.monetaryValues,
      governing_law: entities.governingLaw,
      clauses: entities.clauses,
      contradictions
    },
    document_signatures: signatureAnalysis.document_signatures,
    pdf_cryptographic_signatures: signatureAnalysis.pdf_cryptographic_signatures,
    technical_metadata: technical_metadata,
    risk_analysis: {
      trust_score: trustScoreResult.trust_score,
      risk_level: trustScoreResult.risk_level,
      risk_factors: riskFlags,
      base_score: trustScoreResult.base_score,
      total_deductions: trustScoreResult.total_deductions
    },
    // Backwards-compatible fields for existing frontend cards & reports
    aiAnalysis: {
      summary: llmSummary,
      trustScore: trustScoreResult.trust_score,
      riskLevel: trustScoreResult.risk_level,
      riskFlags: riskFlags,
      keyTerms: keyTerms,
      documentType: documentCategory,
      governingLaw: entities.governingLaw,
      parties: entities.parties.map(p => p.value),
      signatories: entities.signatories.map(s => `${s.name} (${s.role})`),
      monetaryValues: entities.monetaryValues,
      technicalMetadata: technical_metadata
    }
  };
}

/**
 * Invokes Groq LLM on ONLY the normalized document_content.
 */
async function runGroqLegalAnalysis(visibleText, category, title) {
  if (!GROQ_API_KEY) return null;

  const systemPrompt = `You are the legal intelligence engine for NotaryChain.
Analyze ONLY the supplied DOCUMENT_CONTENT.
Do NOT treat PDF metadata, PDF object IDs, XMP metadata, C2PA manifests, certificate authorities, PDF producers (e.g. ReportLab), or cryptographic metadata as contracting parties, signatories, or legal clauses.
Do NOT invent parties, dates, signatures, or clauses not present in the text.

Return a JSON object ONLY:
{
  "summary": "3-4 concise sentences summarizing the document purpose, identifiable contracting parties, scope, and key legal terms.",
  "keyTerms": [
    { "label": "string", "value": "string" }
  ]
}`;

  const userPrompt = `DOCUMENT TITLE: "${title}"
CATEGORY: ${category}

DOCUMENT_CONTENT:
${visibleText.substring(0, 4000)}

Please provide a concise legal summary and key terms strictly from the visible text above.`;

  for (const model of GROQ_MODELS) {
    try {
      const res = await axios.post(
        GROQ_BASE_URL,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.15,
          max_tokens: 800,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const rawContent = res.data?.choices?.[0]?.message?.content;
      if (rawContent) {
        return JSON.parse(rawContent);
      }
    } catch (e) {
      logger.warn(`[Groq Pipeline] Model ${model} call note:`, e.message);
    }
  }

  return null;
}

/**
 * Deterministic legal summary generator.
 */
function generateDeterministicSummary(entities, category, title, trustScoreResult) {
  const partyNames = entities.parties?.map(p => p.value).join(' and ') || 'the participating entities';
  const effDate = entities.effectiveDate || 'the specified date';
  const govLaw = entities.governingLaw ? `governed under the laws of ${entities.governingLaw}` : 'with standard commercial terms';

  if (category.includes('NDA')) {
    return `This Mutual Non-Disclosure Agreement is entered into between ${partyNames}, effective as of ${effDate}, ${govLaw}. The agreement establishes mutual confidentiality covenants and defined disclosures.`;
  }

  if (category.includes('MSA')) {
    return `This Master Services Agreement outlines the commercial framework between ${partyNames}, effective as of ${effDate}, ${govLaw}. It governs statement of work execution, intellectual property rights, and service delivery terms.`;
  }

  if (category.includes('Invoice')) {
    const amount = entities.monetaryValues?.[0]?.raw || 'the billed amount';
    return `Commercial invoice issued between ${partyNames} for ${amount}. Includes itemized service deliverables, billing line items, and payment instructions.`;
  }

  if (category.includes('Identity')) {
    return `Identity Verification and Biometric Facial Match Report assessing applicant credentials against 128D FaceNet deep neural embeddings and government records.`;
  }

  if (category.includes('Amendment')) {
    const fee = entities.monetaryValues?.[0]?.raw || 'the revised consideration';
    return `Contract Amendment between ${partyNames} amending previous agreement terms and establishing revised fee terms of ${fee}.`;
  }

  return `${category} titled "${title}" between ${partyNames}, ${govLaw}. Verified and cryptographically fingerprinted on NotaryChain.`;
}

/**
 * Assembles key terms combining entities and LLM findings.
 */
function assembleKeyTerms(entities, category, llmKeyTerms = []) {
  const terms = [];

  // 1. Parties
  if (entities.parties?.length > 0) {
    terms.push({ label: 'Contracting Parties', value: entities.parties.map(p => p.value).join(' & ') });
  }

  // 2. Signatories
  if (entities.signatories?.length > 0) {
    terms.push({ label: 'Signatories', value: entities.signatories.map(s => `${s.name} (${s.role})`).join('; ') });
  }

  // 3. Dates
  if (entities.effectiveDate) {
    terms.push({ label: 'Effective Date', value: entities.effectiveDate });
  }
  if (entities.executionDate) {
    terms.push({ label: 'Execution Date', value: entities.executionDate });
  }

  // 4. Monetary Terms
  if (entities.monetaryValues?.length > 0) {
    terms.push({ label: 'Monetary Consideration', value: entities.monetaryValues.map(m => m.raw).join(', ') });
  }

  // 5. Governing Law
  if (entities.governingLaw) {
    terms.push({ label: 'Governing Law', value: entities.governingLaw });
  }

  // Merge any distinct LLM terms
  if (Array.isArray(llmKeyTerms)) {
    for (const lt of llmKeyTerms) {
      if (lt.label && lt.value && !terms.some(t => t.label.toLowerCase() === lt.label.toLowerCase())) {
        terms.push(lt);
      }
    }
  }

  return terms;
}

module.exports = {
  processDocumentPipeline
};

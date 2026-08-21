'use strict';

const { normalizeDate, extractMonetaryValues } = require('../../utils/contentNormalizer');

/**
 * entityExtractionService.js
 * 
 * Extracts legal parties, individual signatories, roles, dates, monetary amounts,
 * addresses, governing law, and key clauses with source page attribution.
 */

/**
 * Extracts structured entities from document pages.
 * @param {Array<{ page_number: number, text: string }>} pages - Array of page objects
 * @param {string} fullText - Combined visible document text
 * @returns {object} Intermediate entity representation
 */
function extractEntities(pages = [], fullText = '') {
  const text = fullText || pages.map(p => p.text).join('\n\n');

  const parties = [];
  const signatories = [];
  const dates = [];
  const addresses = [];
  const clauses = [];
  let governingLaw = null;
  let documentId = null;
  let effectiveDate = null;
  let executionDate = null;

  // 1. Extract Document ID (e.g. "NC-TEST-NDA-2026-00417", "INV-88421", "DOC-10923")
  const docIdMatch = text.match(/\b(NC-[A-Z0-9\-]+|INV-[0-9A-Z]+|DOC-[0-9A-Z]+|AGR-[0-9A-Z]+)\b/i) ||
                     text.match(/Document\s*(?:ID|Ref|Number|No)[:.\s]+([A-Z0-9\-_]+)/i);
  if (docIdMatch) {
    documentId = docIdMatch[1].trim();
  }

  // 2. Extract Contracting Parties (Organizations / Companies)
  // Matches "by and between Party A and Party B" or "between Party A and Party B"
  const partyBetweenMatch = text.match(/(?:entered into by and between|by and between|between|parties:)[:\s\n]+([A-Za-z0-9\s.,&'()\/-]{3,80}?)\s+(?:and|&)\s+([A-Za-z0-9\s.,&'()\/-]{3,80}?)(?:\n|Effective|Dated|\.|\s*\(|\s+having|\s+with|$)/i);
  if (partyBetweenMatch) {
    const p1 = cleanPartyName(partyBetweenMatch[1]);
    const p2 = cleanPartyName(partyBetweenMatch[2]);
    if (p1 && !parties.some(p => p.value === p1)) {
      parties.push({ value: p1, type: 'organization', source_page: findPageForSnippet(pages, p1), confidence: 0.98 });
    }
    if (p2 && !parties.some(p => p.value === p2)) {
      parties.push({ value: p2, type: 'organization', source_page: findPageForSnippet(pages, p2), confidence: 0.98 });
    }
  }

  // Match Invoice Seller / Buyer or Client / Provider (single line)
  const sellerMatch = text.match(/(?:Seller|Vendor|Service Provider|Supplier|From)[:\s]+([^\n\r]+)/i);
  if (sellerMatch) {
    const seller = cleanPartyName(sellerMatch[1]);
    if (seller && !parties.some(p => p.value === seller)) {
      parties.push({ value: seller, type: 'seller', source_page: findPageForSnippet(pages, seller), confidence: 0.95 });
    }
  }

  const buyerMatch = text.match(/(?:Buyer|Bill To|Client|Customer|To)[:\s]+([^\n\r]+)/i);
  if (buyerMatch) {
    const buyer = cleanPartyName(buyerMatch[1]);
    if (buyer && !parties.some(p => p.value === buyer)) {
      parties.push({ value: buyer, type: 'buyer', source_page: findPageForSnippet(pages, buyer), confidence: 0.95 });
    }
  }

  // 3. Extract Signatories (Individual humans + their roles)
  // Match patterns like "Signed by Authorized Signatories:\nMei Lin Tan, Chief Executive Officer\nArjun Malhotra, Director"
  const sigBlockRegex = /(?:Signed\s*by|Name|Authorized Signatory|By)[:\s\n]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})[\s\n]+(?:Title|Role|Position|Capacity)[:\s\n]+([A-Za-z\s.,\/-]{3,40})/gi;
  let sigMatch;
  while ((sigMatch = sigBlockRegex.exec(text)) !== null) {
    const name = sigMatch[1].trim();
    const role = sigMatch[2].trim().replace(/[\n\r].*/, '');
    if (name && !name.toLowerCase().includes('reportlab') && !name.toLowerCase().includes('ssl')) {
      if (!signatories.some(s => s.name === name)) {
        signatories.push({
          name,
          role,
          source_page: findPageForSnippet(pages, name),
          confidence: 0.97
        });
      }
    }
  }

  // Match inline signatories like "Mei Lin Tan, Chief Executive Officer" or "Arjun Malhotra, Director"
  const inlineSigRegex = /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[-–—,]\s*(Chief Executive Officer|CEO|Director|Managing Director|VP Legal|President|CTO|Chief Technology Officer|Authorized Representative)\b/gi;
  let inSig;
  while ((inSig = inlineSigRegex.exec(text)) !== null) {
    const name = inSig[1].trim();
    const role = inSig[2].trim();
    if (!signatories.some(s => s.name === name)) {
      signatories.push({
        name,
        role,
        source_page: findPageForSnippet(pages, name),
        confidence: 0.95
      });
    }
  }

  // 4. Extract Key Dates (single line safe)
  // Effective Date
  const effMatch = text.match(/(?:Effective Date|effective as of|entered into on)[:\s]+([^\n\r.]+)/i);
  if (effMatch) {
    const rawDate = effMatch[1].trim();
    const norm = normalizeDate(rawDate);
    if (norm) {
      effectiveDate = norm;
      dates.push({ label: 'Effective Date', raw: rawDate, normalized: norm, source_page: findPageForSnippet(pages, rawDate), confidence: 0.98 });
    }
  }

  // Execution Date
  const execMatch = text.match(/(?:Execution Date|Executed on|Dated)[:\s]+([^\n\r.]+)/i);
  if (execMatch) {
    const rawDate = execMatch[1].trim();
    const norm = normalizeDate(rawDate);
    if (norm) {
      executionDate = norm;
      dates.push({ label: 'Execution Date', raw: rawDate, normalized: norm, source_page: findPageForSnippet(pages, rawDate), confidence: 0.96 });
    }
  }

  // Schedule Dates (e.g. Schedule B Commencement Date)
  const schedMatch = text.match(/(?:Schedule\s*[A-Z]|Appendix\s*[A-Z])[\s\S]*?(?:Date|Commencement)[:\s]+([^\n\r.]+)/i);
  if (schedMatch) {
    const rawDate = schedMatch[1].trim();
    const norm = normalizeDate(rawDate);
    if (norm) {
      dates.push({ label: 'Schedule Date', raw: rawDate, normalized: norm, source_page: findPageForSnippet(pages, rawDate), confidence: 0.95 });
    }
  }

  // 5. Extract Monetary Values
  const monetaryValues = extractMonetaryValues(text).map(m => ({
    ...m,
    source_page: findPageForSnippet(pages, m.raw),
    confidence: 0.96
  }));

  // 6. Extract Governing Law
  const lawMatch = text.match(/(?:governed by|laws of|jurisdiction of)[:\s\n]+(?:the\s+)?([A-Za-z\s]+?)(?:\.|\s+courts|\s+without|\s+and|\n|\r)/i);
  if (lawMatch) {
    const law = lawMatch[1].trim().replace(/^laws of\s+/i, '');
    if (law.length > 2 && law.length < 50) {
      governingLaw = law;
    }
  }

  // 7. Extract Key Clauses
  if (/confidential/i.test(text)) {
    clauses.push({ type: 'confidentiality', title: 'Confidentiality & Non-Disclosure', status: 'present', confidence: 0.95 });
  }
  if (/termination/i.test(text)) {
    clauses.push({ type: 'termination', title: 'Termination & Notice', status: 'present', confidence: 0.95 });
  }
  if (/liability/i.test(text)) {
    clauses.push({ type: 'liability', title: 'Limitation of Liability', status: 'present', confidence: 0.95 });
  }
  if (/dispute/i.test(text) || /arbitration/i.test(text)) {
    clauses.push({ type: 'dispute_resolution', title: 'Dispute Resolution & Jurisdiction', status: 'present', confidence: 0.95 });
  }

  return {
    documentId,
    parties,
    signatories,
    dates,
    effectiveDate,
    executionDate,
    monetaryValues,
    governingLaw,
    clauses,
    addresses
  };
}

/**
 * Finds the page number where a snippet of text occurs.
 */
function findPageForSnippet(pages, snippet) {
  if (!snippet || !pages || pages.length === 0) return 1;
  const cleanSnippet = snippet.toLowerCase().trim();
  for (const p of pages) {
    if (p.text && p.text.toLowerCase().includes(cleanSnippet)) {
      return p.page_number;
    }
  }
  return 1;
}

/**
 * Cleans extracted company / party names.
 */
function cleanPartyName(raw) {
  if (!raw) return null;
  let clean = raw.trim()
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[\n\r].*$/, '') // Trim anything after a newline
    .replace(/^(?:by and between|entered into by and between|entered into|between)\s+/i, '')
    .replace(/\s+having\s+its\s+office.*$/i, '')
    .replace(/\s+incorporated\s+in.*$/i, '')
    .trim();

  if (clean.length < 3 || /^(the|and|or|between|party|parties|by and between|entered into|signed by|this agreement)$/i.test(clean)) return null;
  return clean;
}

module.exports = {
  extractEntities
};

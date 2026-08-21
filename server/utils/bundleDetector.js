const crypto = require('crypto');
const logger = require('./logger');

/**
 * Document Type & Boundary Signatures
 */
const DOCUMENT_SIGNATURES = [
  {
    category: 'NDA',
    canonicalTitle: 'Mutual Non-Disclosure Agreement',
    regex: /(?:DOCUMENT\s*0?1[:\s\n-]*|\b)(?:MUTUAL\s+NON[- ]DISCLOSURE\s+AGREEMENT|NON[- ]DISCLOSURE\s+AGREEMENT|CONFIDENTIALITY\s+AGREEMENT)\b/i
  },
  {
    category: 'MSA',
    canonicalTitle: 'Master Services Agreement',
    regex: /(?:DOCUMENT\s*0?2[:\s\n-]*|\b)(?:MASTER\s+SERVICES?\s+AGREEMENT|STATEMENT\s+OF\s+WORK|SERVICE\s+LEVEL\s+AGREEMENT)\b/i
  },
  {
    category: 'INVOICE',
    canonicalTitle: 'Commercial Invoice',
    regex: /(?:DOCUMENT\s*0?3[:\s\n-]*|\b)(?:COMMERCIAL\s+INVOICE|TAX\s+INVOICE|PROFORMA\s+INVOICE|BILLING\s+STATEMENT|INVOICE\s+NO[:\s\n#]+)/i
  },
  {
    category: 'IDENTITY VERIFICATION',
    canonicalTitle: 'Identity Verification Report',
    regex: /(?:DOCUMENT\s*0?4[:\s\n-]*|\b)(?:IDENTITY\s+VERIFICATION\s+(?:REPORT|DOSSIER)|BIOMETRIC\s+VERIFICATION\s+DOSSIER|KYC\s+VERIFICATION\s+DOSSIER)\b/i
  },
  {
    category: 'AMENDMENT',
    canonicalTitle: 'Contract Amendment',
    regex: /(?:DOCUMENT\s*0?5[:\s\n-]*|\b)(?:AMENDMENT\s+TO\s+(?:MASTER\s+SERVICES?\s+AGREEMENT|AGREEMENT|CONTRACT)|CONTRACT\s+AMENDMENT|AMENDMENT\s+AGREEMENT)\b/i
  },
  {
    category: 'EMPLOYMENT',
    canonicalTitle: 'Employment Agreement',
    regex: /(?:EMPLOYMENT\s+AGREEMENT|OFFER\s+LETTER|EMPLOYMENT\s+CONTRACT)\b/i
  }
];

/**
 * Segment a text block or pages into distinct documents
 */
function detectDocumentBundle(documentContent, uploadFilename = 'Document') {
  const pages = documentContent?.pages || [];
  if (pages.length === 0) {
    return {
      document_mode: 'SINGLE',
      total_documents: 1,
      documents: [{
        document_index: 1,
        title: uploadFilename,
        category: 'general',
        pages: [],
        content: { pages: [] }
      }]
    };
  }

  // 1. First, check if multi-document markers exist across pages or inside combined text
  const fullText = pages.map(p => p.text).join('\n\n--- PAGE BREAK ---\n\n');
  
  // Find all occurrences of document signatures
  const matchedDocs = [];

  // Check explicit "DOCUMENT 01", "DOCUMENT 1", "DOCUMENT 02", etc. or signature headers
  pages.forEach((pageObj) => {
    const pNum = pageObj.page_number;
    const pText = pageObj.text;

    // Check if a page starts a new document or contains distinct document sections
    DOCUMENT_SIGNATURES.forEach(sig => {
      const match = sig.regex.exec(pText);
      if (match) {
        matchedDocs.push({
          indexInPage: match.index,
          page_number: pNum,
          category: sig.category,
          canonicalTitle: sig.canonicalTitle,
          matchedText: match[0]
        });
      }
    });
  });

  // Sort by page number and position
  matchedDocs.sort((a, b) => {
    if (a.page_number !== b.page_number) return a.page_number - b.page_number;
    return a.indexInPage - b.indexInPage;
  });

  // Filter duplicate matches of the same document category on the same page
  const uniqueStarts = [];
  const seenCategories = new Set();
  matchedDocs.forEach(m => {
    const key = `${m.category}`;
    if (!seenCategories.has(key)) {
      seenCategories.add(key);
      uniqueStarts.push(m);
    }
  });

  // If 2 or more distinct documents detected, it's a BUNDLE
  if (uniqueStarts.length > 1) {
    const partitionedDocs = [];

    // If documents are split across full pages
    for (let i = 0; i < uniqueStarts.length; i++) {
      const current = uniqueStarts[i];
      const next = uniqueStarts[i + 1];

      const startPage = current.page_number;
      const endPage = next ? (next.page_number > startPage ? next.page_number - 1 : next.page_number) : pages[pages.length - 1].page_number;

      // Collect page objects
      let docPages = pages.filter(p => p.page_number >= startPage && p.page_number <= endPage);

      // If multiple docs on the same page (e.g. single-page test suite or contiguous text)
      const samePageMatches = uniqueStarts.filter(u => u.page_number === startPage);
      if (samePageMatches.length > 1 || pages.length === 1) {
        const pageText = pages.find(p => p.page_number === startPage)?.text || '';
        const startIdx = current.indexInPage;
        const endIdx = next && next.page_number === startPage ? next.indexInPage : (next ? next.indexInPage : pageText.length);
        const subText = pageText.substring(startIdx, endIdx).trim();

        docPages = [{
          page_number: startPage,
          text: subText
        }];
      }

      const combinedText = docPages.map(p => p.text).join('\n\n');
      const contentHash = crypto.createHash('sha256').update(combinedText).digest('hex');

      partitionedDocs.push({
        document_index: i + 1,
        title: current.canonicalTitle,
        category: current.category,
        pages: [...new Set(docPages.map(p => p.page_number))],
        content_hash: contentHash,
        content: { pages: docPages }
      });
    }

    return {
      document_mode: 'BUNDLE',
      total_documents: partitionedDocs.length,
      documents: partitionedDocs
    };
  }

  // Also check single page with multiple sections (e.g. "DOCUMENT 01: ... DOCUMENT 02: ...")
  if (pages.length === 1) {
    const singleText = pages[0].text;
    const docSplits = singleText.split(/(?=(?:DOCUMENT\s*0?\d|MUTUAL\s+NON[- ]DISCLOSURE|MASTER\s+SERVICES?\s+AGREEMENT|COMMERCIAL\s+INVOICE|IDENTITY\s+VERIFICATION\s+(?:REPORT|DOSSIER)|AMENDMENT\s+TO\s+(?:MASTER|AGREEMENT)))/i);

    if (docSplits.length > 1) {
      const subDocs = [];
      docSplits.forEach((chunk, idx) => {
        const trimmed = chunk.trim();
        if (trimmed.length < 20) return;

        let detectedTitle = `Document ${idx + 1}`;
        let detectedCat = 'general';

        for (const sig of DOCUMENT_SIGNATURES) {
          if (sig.regex.test(trimmed)) {
            detectedTitle = sig.canonicalTitle;
            detectedCat = sig.category;
            break;
          }
        }

        const cHash = crypto.createHash('sha256').update(trimmed).digest('hex');
        subDocs.push({
          document_index: subDocs.length + 1,
          title: detectedTitle,
          category: detectedCat,
          pages: [1],
          content_hash: cHash,
          content: { pages: [{ page_number: 1, text: trimmed }] }
        });
      });

      if (subDocs.length > 1) {
        return {
          document_mode: 'BUNDLE',
          total_documents: subDocs.length,
          documents: subDocs
        };
      }
    }
  }

  // Single document mode
  const singleDocTitle = uploadFilename || 'Document';
  const singleHash = crypto.createHash('sha256').update(fullText).digest('hex');
  return {
    document_mode: 'SINGLE',
    total_documents: 1,
    documents: [{
      document_index: 1,
      title: singleDocTitle,
      category: 'contract',
      pages: pages.map(p => p.page_number),
      content_hash: singleHash,
      content: documentContent
    }]
  };
}

module.exports = {
  detectDocumentBundle,
  DOCUMENT_SIGNATURES
};

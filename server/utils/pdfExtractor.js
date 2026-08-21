'use strict';

const zlib = require('zlib');
const logger = require('./logger');
const { extractTechnicalMetadata, parsePdfPages } = require('./pdfStructureParser');
const OCRService = require('../services/ai/ocrService');
const ocrService = typeof OCRService === 'function' ? new OCRService() : (OCRService.ocrService || OCRService);

/**
 * pdfExtractor.js
 * 
 * Production Page-by-Page Document Text and Metadata Extractor.
 * Extracts pure, visible document text isolated from PDF dictionary internals,
 * ReportLab metadata, C2PA manifests, and SSL certificates.
 */

const MIN_TEXT_THRESHOLD = 30; // Characters per page before OCR fallback

/**
 * Extracts visible document text and separated technical metadata from any uploaded document.
 * 
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - e.g. 'application/pdf', 'text/plain'
 * @param {string} fileName - Original file name
 * @param {string} clientExtractedText - Optional pre-extracted text from browser
 * @returns {Promise<{
 *   document_content: { pages: Array<{ page_number: number, text: string }>, full_text: string },
 *   technical_metadata: object,
 *   extraction_confidence: number,
 *   ocr_used: boolean
 * }>}
 */
async function extractDocumentData(buffer, mimeType, fileName, clientExtractedText = '') {
  let technicalMetadata = extractTechnicalMetadata(buffer);
  let pages = [];
  let fullText = '';
  let ocrUsed = false;
  let extractionConfidence = 100;

  try {
    if (!buffer || buffer.length === 0) {
      return {
        document_content: { pages: [], full_text: '' },
        technical_metadata: technicalMetadata,
        extraction_confidence: 0,
        ocr_used: false
      };
    }

    const isPdf = mimeType === 'application/pdf' ||
                  (fileName && fileName.toLowerCase().endsWith('.pdf')) ||
                  (buffer.length >= 5 && buffer.slice(0, 5).toString('latin1').includes('%PDF'));

    if (isPdf) {
      // 1. Parse PDF pages and isolated content streams
      const parsedPages = parsePdfPages(buffer);
      const cMap = extractCMapFromBuffer(buffer);

      for (const p of parsedPages) {
        const pageTextPieces = [];

        for (const stream of p.raw_content_streams) {
          const streamText = extractTextFromStream(stream, cMap);
          if (streamText && streamText.trim().length > 0) {
            pageTextPieces.push(streamText.trim());
          }
        }

        let pageCleanText = sanitizeExtractedText(pageTextPieces.join('\n'));

        // 2. OCR Fallback for empty or image-only pages
        if (pageCleanText.length < MIN_TEXT_THRESHOLD) {
          try {
            // Attempt secondary pdf-parse text extraction for this page
            const secondaryText = await tryPdfParseFallback(buffer);
            if (secondaryText && secondaryText.length >= MIN_TEXT_THRESHOLD) {
              pageCleanText = secondaryText;
            } else if (buffer.length > 500) {
              // Attempt OCR on buffer
              const ocrRes = await ocrService.processBuffer(buffer, 'application/pdf', { pageNumber: p.page_number });
              if (ocrRes?.text && ocrRes.text.length > pageCleanText.length) {
                pageCleanText = ocrRes.text;
                ocrUsed = true;
                extractionConfidence = ocrRes.confidence || 85;
              }
            }
          } catch (ocrErr) {
            logger.warn(`[PDF Extractor] OCR fallback note on page ${p.page_number}:`, ocrErr.message);
          }
        }

        pages.push({
          page_number: p.page_number,
          text: pageCleanText
        });
      }

      // If client pre-extracted text exists and backend extracted text is shorter, merge / enrich
      if (clientExtractedText && clientExtractedText.trim().length > 20) {
        const totalLen = pages.reduce((sum, p) => sum + p.text.length, 0);
        if (totalLen < 30) {
          pages = [{ page_number: 1, text: sanitizeExtractedText(clientExtractedText.trim()) }];
        }
      }

      fullText = pages.map(p => p.text).filter(Boolean).join('\n\n');

      // If full text is still empty, mark extraction failed
      if (fullText.length < 15) {
        extractionConfidence = 0;
      }

      return {
        document_content: { pages, full_text: fullText },
        technical_metadata: technicalMetadata,
        extraction_confidence: extractionConfidence,
        ocr_used: ocrUsed
      };
    }

    // 3. Handle DOCX
    const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   mimeType === 'application/msword' ||
                   (fileName && (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc'))) ||
                   (buffer.length >= 4 && buffer.slice(0, 4).toString('hex') === '504b0304');
    if (isDocx) {
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        const docxText = sanitizeExtractedText(result.value || '');
        return {
          document_content: {
            pages: [{ page_number: 1, text: docxText }],
            full_text: docxText
          },
          technical_metadata: technicalMetadata,
          extraction_confidence: docxText.length > 20 ? 98 : 30,
          ocr_used: false
        };
      } catch (docErr) {
        logger.warn('[PDF Extractor] Mammoth DOCX parsing error:', docErr.message);
      }
    }

    // 4. Handle Plain Text / Markdown
    try {
      const utf8Str = buffer.toString('utf8');
      let printable = 0;
      const checkLen = Math.min(utf8Str.length, 1000);
      for (let i = 0; i < checkLen; i++) {
        const code = utf8Str.charCodeAt(i);
        if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) printable++;
      }
      if (checkLen > 0 && printable / checkLen > 0.75 && utf8Str.trim().length >= 10) {
        const text = sanitizeExtractedText(utf8Str.trim());
        return {
          document_content: {
            pages: [{ page_number: 1, text }],
            full_text: text
          },
          technical_metadata: technicalMetadata,
          extraction_confidence: 100,
          ocr_used: false
        };
      }
    } catch {}

    // 5. Handle Image Files (PNG, JPG, WEBP, TIFF) -> Run OCR
    const isImage = mimeType?.startsWith('image/') || /\.(png|jpe?g|webp|tiff?|bmp)$/i.test(fileName || '');
    if (isImage) {
      const ocrRes = await ocrService.processBuffer(buffer, mimeType);
      const imgText = sanitizeExtractedText(ocrRes.text || '');
      return {
        document_content: {
          pages: [{ page_number: 1, text: imgText }],
          full_text: imgText
        },
        technical_metadata: technicalMetadata,
        extraction_confidence: ocrRes.confidence || 80,
        ocr_used: true
      };
    }

    return {
      document_content: {
        pages: [{ page_number: 1, text: '' }],
        full_text: ''
      },
      technical_metadata: technicalMetadata,
      extraction_confidence: 0,
      ocr_used: false
    };
  } catch (err) {
    logger.error('[PDF Extractor] Fatal extraction error:', err.message);
    return {
      document_content: { pages: [], full_text: '' },
      technical_metadata: technicalMetadata,
      extraction_confidence: 0,
      ocr_used: false,
      error: err.message
    };
  }
}

/**
 * Extracts CMap font character mappings across PDF buffer.
 */
function extractCMapFromBuffer(buffer) {
  const cMap = new Map();
  try {
    const raw = buffer.toString('latin1');

    // bfchar: <0001> <0048>
    const bfcharRegex = /<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>/g;
    let bfc;
    while ((bfc = bfcharRegex.exec(raw)) !== null) {
      const code = parseInt(bfc[1], 16);
      const uni = String.fromCodePoint(parseInt(bfc[2], 16));
      cMap.set(code, uni);
    }

    // bfrange: <0001> <0005> <0041>
    const bfrangeRegex = /<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>/g;
    let bfr;
    while ((bfr = bfrangeRegex.exec(raw)) !== null) {
      const start = parseInt(bfr[1], 16);
      const end = parseInt(bfr[2], 16);
      let uniStart = parseInt(bfr[3], 16);
      for (let c = start; c <= end; c++) {
        cMap.set(c, String.fromCodePoint(uniStart++));
      }
    }
  } catch {}
  return cMap;
}

/**
 * Extracts visible text chunks from a decompressed content stream.
 */
function extractTextFromStream(stream, cMap) {
  const lines = [];

  const decodeHex = (hex) => {
    hex = hex.replace(/\s+/g, '');
    let res = '';
    if (hex.length >= 4 && hex.length % 4 === 0) {
      for (let i = 0; i < hex.length; i += 4) {
        const val = parseInt(hex.substr(i, 4), 16);
        if (cMap && cMap.has(val)) res += cMap.get(val);
        else if (val >= 32 && val <= 126) res += String.fromCharCode(val);
      }
    }
    if (!res && hex.length >= 2 && hex.length % 2 === 0) {
      for (let i = 0; i < hex.length; i += 2) {
        const val = parseInt(hex.substr(i, 2), 16);
        if (cMap && cMap.has(val)) res += cMap.get(val);
        else if (val >= 32 && val <= 126) res += String.fromCharCode(val);
      }
    }
    return res.trim();
  };

  const decodeLiteral = (lit) => {
    return lit
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
      .trim();
  };

  // 1. Literal Tj: (Text) Tj
  const tjLit = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
  let m;
  while ((m = tjLit.exec(stream)) !== null) {
    const d = decodeLiteral(m[1]);
    if (d.length > 0 && !/^[\x00-\x1F]+$/.test(d)) lines.push(d);
  }

  // 2. Hex Tj: <00480065> Tj
  const tjHex = /<([0-9a-fA-F\s]+)>\s*Tj/g;
  while ((m = tjHex.exec(stream)) !== null) {
    const d = decodeHex(m[1]);
    if (d.length > 0 && !/^[\x00-\x1F]+$/.test(d)) lines.push(d);
  }

  // 3. Array TJ: [(Text) 10 <Hex>] TJ
  const tjArray = /\[([\s\S]*?)\]\s*TJ/g;
  while ((m = tjArray.exec(stream)) !== null) {
    const inner = m[1];
    const partRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)|<([0-9a-fA-F\s]+)>/g;
    let p;
    let line = '';
    while ((p = partRegex.exec(inner)) !== null) {
      if (p[1] !== undefined) line += decodeLiteral(p[1]) + ' ';
      else if (p[2] !== undefined) line += decodeHex(p[2]) + ' ';
    }
    if (line.trim().length > 0) lines.push(line.trim());
  }

  // If Tj/TJ operators yielded text, return it
  const result = lines.join(' ').replace(/\s+/g, ' ').trim();
  if (result.length >= 10) return result;

  // Fallback: Scan stream for English text sentences
  const englishMatches = stream.match(/[A-Z][a-zA-Z0-9,.:;'"\-\s]{15,}/g);
  if (englishMatches) {
    const cleaned = englishMatches
      .filter(s => !s.includes('endobj') && !s.includes('xref') && !s.includes('trailer') && !s.includes('FlateDecode'))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length >= 15) return cleaned;
  }

  return result;
}

/**
 * Secondary fallback using pdf-parse if available.
 */
async function tryPdfParseFallback(buffer) {
  try {
    const pdfModule = require('pdf-parse');
    const PDFClass = pdfModule.PDFParse || (pdfModule.default && pdfModule.default.PDFParse);
    if (PDFClass && typeof PDFClass === 'function') {
      const parser = new PDFClass({ data: buffer });
      if (typeof parser.load === 'function') await parser.load();
      const res = await parser.getText();
      if (res?.text && res.text.trim().length >= MIN_TEXT_THRESHOLD) return sanitizeExtractedText(res.text.trim());
    } else if (typeof pdfModule === 'function') {
      const data = await pdfModule(buffer);
      if (data?.text && data.text.trim().length >= MIN_TEXT_THRESHOLD) return sanitizeExtractedText(data.text.trim());
    }
  } catch {}
  return '';
}

/**
 * Sanitizes extracted text by removing internal PDF object references,
 * ReportLab producer lines, and raw XML XMP blocks that could leak into legal text.
 */
function sanitizeExtractedText(rawText) {
  if (!rawText) return '';

  return rawText
    // Remove raw XML packets
    .replace(/<\?xpacket[\s\S]*?\?>/gi, '')
    .replace(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/gi, '')
    .replace(/<rdf:RDF[\s\S]*?<\/rdf:RDF>/gi, '')
    // Remove PDF syntax artifacts
    .replace(/\b\d+\s+\d+\s+obj\b/g, '')
    .replace(/\bendobj\b/g, '')
    .replace(/\bxref\b[\s\S]*?trailer/gi, '')
    .replace(/\bstartxref[\s\S]*?%%EOF/gi, '')
    .replace(/\/Type\s*\/[A-Za-z0-9]+/g, '')
    .replace(/\/Filter\s*\/[A-Za-z0-9]+/g, '')
    .replace(/\/Length\s+\d+/g, '')
    // Remove isolated ReportLab producer metadata lines
    .replace(/ReportLab Generated PDF document[\s\S]*?http:\/\/www\.reportlab\.com/gi, '')
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

module.exports = {
  MIN_TEXT_THRESHOLD,
  extractDocumentData,
  sanitizeExtractedText
};

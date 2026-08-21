const zlib = require('zlib');
const logger = require('./logger');

/**
 * Technical Metadata Keywords & Filter Lists
 * These must NEVER be treated as legal document content.
 */
const METADATA_SIGNATURE_KEYWORDS = [
  'reportlab', 'pdf producer', 'pdf creator', 'xmp', 'c2pa', 'ssl.com',
  'certificate authority', 'root ca', 'ica r1', 'rsa root', 'pkcs',
  'flatedecode', 'endobj', 'obj <<', 'trailer <<', 'xref'
];

/**
 * Extract technical and cryptographic provenance metadata from raw PDF bytes.
 */
function extractTechnicalMetadata(buffer) {
  const meta = {
    pdf_creator: '',
    pdf_producer: '',
    creation_timestamp: '',
    c2pa: {},
    certificates: {},
    xmp: {},
    cryptographic_metadata: {}
  };

  if (!buffer || buffer.length === 0) return meta;
  const raw = buffer.toString('latin1');

  // 1. PDF Producer & Creator
  const producerMatch = raw.match(/\/Producer\s*\(([^)]+)\)/i) || raw.match(/\/Producer\s*<([^>]+)>/i);
  if (producerMatch) meta.pdf_producer = producerMatch[1].trim();

  const creatorMatch = raw.match(/\/Creator\s*\(([^)]+)\)/i) || raw.match(/\/Creator\s*<([^>]+)>/i);
  if (creatorMatch) meta.pdf_creator = creatorMatch[1].trim();

  const dateMatch = raw.match(/\/CreationDate\s*\(([^)]+)\)/i);
  if (dateMatch) meta.creation_timestamp = dateMatch[1].trim();

  // 2. C2PA / Digital Signature references
  if (raw.includes('c2pa') || raw.includes('C2PA')) {
    meta.c2pa = {
      detected: true,
      manifest_type: 'C2PA Cryptographic Provenance Claim',
      standard: 'C2PA 1.3 / ISO 22144'
    };
  }

  // 3. SSL.com / X.509 Certificate Authorities
  const sslMatch = raw.match(/(SSL\.com[^\r\n()<>{}\[\]]+)/i);
  if (sslMatch) {
    meta.certificates = {
      detected: true,
      issuer: sslMatch[1].trim(),
      type: 'X.509 Cryptographic Certificate'
    };
  }

  // 4. XMP Metadata packet
  const xmpMatch = raw.match(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/i);
  if (xmpMatch) {
    meta.xmp = {
      detected: true,
      length: xmpMatch[0].length
    };
  }

  return meta;
}

/**
 * Filter out technical metadata, XMP, C2PA headers, and ReportLab internal markers from extracted text.
 */
function filterOutTechnicalMetadata(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const cleanLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is purely PDF metadata or certificate dump
    const lower = trimmed.toLowerCase();
    const isTechnicalDump =
      lower.startsWith('<?xpacket') ||
      lower.startsWith('<x:xmpmeta') ||
      lower.startsWith('xmlns:') ||
      lower.includes('c2pa.claim') ||
      lower.includes('ssl.com c2pa') ||
      lower.includes('ssl.com rsa root') ||
      lower.includes('reportlab generated') ||
      lower.includes('pdf-1.') ||
      lower.includes('/flatedecode') ||
      lower.includes('trailer <</');

    if (!isTechnicalDump) {
      cleanLines.push(trimmed);
    }
  }

  return cleanLines.join('\n').trim();
}

/**
 * Parse page-aware text from PDF using pure JavaScript decompression + CMap table decoding.
 * Guaranteed 100% serverless safe with zero external worker threads.
 */
function extractPdfPagesPure(buffer) {
  try {
    if (!buffer || buffer.length === 0) return [];
    const raw = buffer.toString('latin1');
    const allStreams = [];

    // Extract all streams
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let sm;
    while ((sm = streamRegex.exec(raw)) !== null) {
      const rawStream = sm[1];
      try {
        const streamBuf = Buffer.from(rawStream, 'latin1');
        let inflated = null;
        try {
          inflated = zlib.inflateSync(streamBuf);
        } catch {
          try {
            inflated = zlib.inflateRawSync(streamBuf);
          } catch {}
        }
        if (inflated) {
          const lat = inflated.toString('latin1');
          // Skip pure XML metadata streams
          if (!lat.includes('<x:xmpmeta') && !lat.includes('<?xpacket')) {
            allStreams.push(lat);
          }
        }
      } catch {}
    }

    // Parse CMaps
    const cMap = new Map();
    allStreams.forEach(stream => {
      const bfcharRegex = /<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>/g;
      let bfc;
      while ((bfc = bfcharRegex.exec(stream)) !== null) {
        const code = parseInt(bfc[1], 16);
        const uni = String.fromCodePoint(parseInt(bfc[2], 16));
        cMap.set(code, uni);
      }
      const bfrangeRegex = /<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>\s+<([0-9a-fA-F]+)>/g;
      let bfr;
      while ((bfr = bfrangeRegex.exec(stream)) !== null) {
        const start = parseInt(bfr[1], 16);
        const end = parseInt(bfr[2], 16);
        let uniStart = parseInt(bfr[3], 16);
        for (let c = start; c <= end; c++) {
          cMap.set(c, String.fromCodePoint(uniStart++));
        }
      }
    });

    const decodeHex = (hex) => {
      hex = hex.replace(/\s+/g, '');
      let res = '';
      if (hex.length >= 4 && hex.length % 4 === 0) {
        for (let i = 0; i < hex.length; i += 4) {
          const val = parseInt(hex.substr(i, 4), 16);
          if (cMap.has(val)) res += cMap.get(val);
          else if (val >= 32 && val <= 126) res += String.fromCharCode(val);
        }
      }
      if (!res && hex.length >= 2 && hex.length % 2 === 0) {
        for (let i = 0; i < hex.length; i += 2) {
          const val = parseInt(hex.substr(i, 2), 16);
          if (cMap.has(val)) res += cMap.get(val);
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

    const pageChunks = [];
    allStreams.forEach(stream => {
      const chunks = [];
      // (Literal) Tj
      const tjLit = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
      let m;
      while ((m = tjLit.exec(stream)) !== null) {
        const d = decodeLiteral(m[1]);
        if (d.length > 0 && !/^[\x00-\x1F]+$/.test(d)) chunks.push(d);
      }

      // <Hex> Tj
      const tjHex = /<([0-9a-fA-F\s]+)>\s*Tj/g;
      while ((m = tjHex.exec(stream)) !== null) {
        const d = decodeHex(m[1]);
        if (d.length > 0 && !/^[\x00-\x1F]+$/.test(d)) chunks.push(d);
      }

      // [(Array) 10 <Hex>] TJ
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
        if (line.trim().length > 0) chunks.push(line.trim());
      }

      if (chunks.length > 0) {
        const text = chunks.join('\n');
        const clean = filterOutTechnicalMetadata(text);
        if (clean.length > 0) pageChunks.push(clean);
      }
    });

    if (pageChunks.length > 0) {
      return pageChunks.map((text, idx) => ({
        page_number: idx + 1,
        text
      }));
    }

    return [];
  } catch (err) {
    logger.warn('extractPdfPagesPure error:', err.message);
    return [];
  }
}

/**
 * Universal Master Document Parser
 * Returns: {
 *   document_content: { pages: [{ page_number: 1, text: "..." }] },
 *   technical_metadata: { ... },
 *   extraction_status: 'SUCCESS' | 'EXTRACTION_INSUFFICIENT' | 'REQUIRES_OCR',
 *   total_chars: number
 * }
 */
async function extractDocumentContentAndMetadata(fileBuffer, mimeType, fileName, clientExtractedText = '') {
  const technicalMetadata = extractTechnicalMetadata(fileBuffer);
  let pages = [];

  // If client provided text (e.g. from plain text / markdown / client reader)
  if (clientExtractedText && clientExtractedText.trim().length >= 15) {
    pages = [{
      page_number: 1,
      text: filterOutTechnicalMetadata(clientExtractedText.trim())
    }];
  }

  const isPdf = mimeType === 'application/pdf' ||
                (fileName && fileName.toLowerCase().endsWith('.pdf')) ||
                (fileBuffer && fileBuffer.length >= 5 && fileBuffer.slice(0, 5).toString('latin1').includes('%PDF'));

  if (pages.length === 0 && isPdf && fileBuffer && fileBuffer.length > 0) {
    // 1. Try pure JS page-aware extractor
    pages = extractPdfPagesPure(fileBuffer);

    // 2. Try pdf-parse v2 if pure JS got few or no words
    if (pages.length === 0 || pages.reduce((acc, p) => acc + p.text.length, 0) < 30) {
      try {
        const pdfModule = require('pdf-parse');
        const PDFClass = pdfModule.PDFParse || (pdfModule.default && pdfModule.default.PDFParse);
        if (PDFClass && typeof PDFClass === 'function') {
          const parser = new PDFClass({ data: fileBuffer });
          if (typeof parser.load === 'function') await parser.load();
          const res = await parser.getText();
          if (res?.text && res.text.trim().length >= 15) {
            const rawPages = res.text.split(/--\s*\d+\s*of\s*\d+\s*--/);
            pages = rawPages
              .map((p, idx) => ({
                page_number: idx + 1,
                text: filterOutTechnicalMetadata(p.trim())
              }))
              .filter(p => p.text.length > 0);
          }
        }
      } catch {}
    }
  }

  // DOCX support
  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 mimeType === 'application/msword' ||
                 (fileName && (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc'))) ||
                 (fileBuffer && fileBuffer.length >= 4 && fileBuffer.slice(0, 4).toString('hex') === '504b0304');
  if (pages.length === 0 && isDocx && fileBuffer && fileBuffer.length > 0) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      if (result.value && result.value.trim().length >= 10) {
        pages = [{
          page_number: 1,
          text: filterOutTechnicalMetadata(result.value.trim())
        }];
      }
    } catch {}
  }

  // Plain text / UTF-8 fallback
  if (pages.length === 0 && fileBuffer && fileBuffer.length > 0) {
    try {
      const utf8Str = fileBuffer.toString('utf8');
      let printable = 0;
      const checkLen = Math.min(utf8Str.length, 1000);
      for (let i = 0; i < checkLen; i++) {
        const code = utf8Str.charCodeAt(i);
        if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) printable++;
      }
      if (checkLen > 0 && printable / checkLen > 0.75 && utf8Str.trim().length >= 15) {
        pages = [{
          page_number: 1,
          text: filterOutTechnicalMetadata(utf8Str.trim())
        }];
      }
    } catch {}
  }

  const totalChars = pages.reduce((acc, p) => acc + p.text.length, 0);

  let extractionStatus = 'SUCCESS';
  let requiresOcr = false;

  if (totalChars < 20) {
    extractionStatus = 'EXTRACTION_INSUFFICIENT';
    requiresOcr = true;
  }

  return {
    document_content: { pages },
    technical_metadata: technicalMetadata,
    extraction_status: extractionStatus,
    requires_ocr: requiresOcr,
    total_chars: totalChars
  };
}

module.exports = {
  extractTechnicalMetadata,
  filterOutTechnicalMetadata,
  extractPdfPagesPure,
  extractDocumentContentAndMetadata
};

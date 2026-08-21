'use strict';

const zlib = require('zlib');
const logger = require('./logger');

/**
 * pdfStructureParser.js
 * 
 * Inspects PDF object structures to:
 * 1. Extract and isolate technical metadata (ReportLab producer, XMP metadata, C2PA manifests, SSL certificates)
 * 2. Locate individual page object boundaries and page `/Contents` stream IDs
 * 3. Guarantee that technical metadata is never mixed with legal document text
 */

/**
 * Extracts technical and cryptographic metadata from raw PDF bytes.
 * @param {Buffer} buffer - Exact uploaded file buffer
 * @returns {object} technical_metadata
 */
function extractTechnicalMetadata(buffer) {
  const metadata = {
    pdf_version: '1.4',
    pdf_producer: null,
    pdf_creator: null,
    creation_date: null,
    modification_date: null,
    is_reportlab: false,
    c2pa: {
      has_c2pa: false,
      manifest_id: null,
      claim_generator: null,
      signature_issuer: null
    },
    certificate: {
      has_certificate: false,
      issuer: null,
      subject: null,
      algorithm: null,
      certificate_chain: []
    },
    xmp: {
      has_xmp: false,
      raw_xmp: null,
      dc_creator: null,
      dc_title: null,
      xmp_create_date: null
    },
    cryptographic_metadata: {
      byte_range: null,
      filter: null,
      sub_filter: null
    }
  };

  try {
    if (!buffer || buffer.length < 10) return metadata;
    const raw = buffer.toString('latin1');

    // 1. Detect PDF Version
    const verMatch = raw.match(/%PDF-(\d+\.\d+)/);
    if (verMatch) metadata.pdf_version = verMatch[1];

    // 2. Extract Info dictionary attributes (/Producer, /Creator, /CreationDate)
    const producerMatch = raw.match(/\/Producer\s*\(([^)]+)\)/i) || raw.match(/\/Producer\s*<([0-9a-fA-F]+)>/i);
    if (producerMatch) {
      metadata.pdf_producer = decodePdfString(producerMatch[1]);
      if (/reportlab/i.test(metadata.pdf_producer)) {
        metadata.is_reportlab = true;
      }
    }

    const creatorMatch = raw.match(/\/Creator\s*\(([^)]+)\)/i) || raw.match(/\/Creator\s*<([0-9a-fA-F]+)>/i);
    if (creatorMatch) {
      metadata.pdf_creator = decodePdfString(creatorMatch[1]);
    }

    const createDateMatch = raw.match(/\/CreationDate\s*\(([^)]+)\)/i);
    if (createDateMatch) {
      metadata.creation_date = parsePdfDate(createDateMatch[1]);
    }

    const modDateMatch = raw.match(/\/ModDate\s*\(([^)]+)\)/i);
    if (modDateMatch) {
      metadata.modification_date = parsePdfDate(modDateMatch[1]);
    }

    // 3. Extract XMP metadata packet (<?xpacket ... ?>)
    const xmpStart = raw.indexOf('<?xpacket begin');
    if (xmpStart !== -1) {
      const xmpEnd = raw.indexOf('<?xpacket end', xmpStart);
      if (xmpEnd !== -1) {
        metadata.xmp.has_xmp = true;
        const xmpString = raw.substring(xmpStart, xmpEnd + 19);
        metadata.xmp.raw_xmp = xmpString.substring(0, 2000);

        const dcCreatorMatch = xmpString.match(/<dc:creator>[\s\S]*?<rdf:li>([^<]+)<\/rdf:li>/i);
        if (dcCreatorMatch) metadata.xmp.dc_creator = dcCreatorMatch[1].trim();

        const dcTitleMatch = xmpString.match(/<dc:title>[\s\S]*?<rdf:li>([^<]+)<\/rdf:li>/i);
        if (dcTitleMatch) metadata.xmp.dc_title = dcTitleMatch[1].trim();

        const xmpDateMatch = xmpString.match(/<xmp:CreateDate>([^<]+)<\/xmp:CreateDate>/i);
        if (xmpDateMatch) metadata.xmp.xmp_create_date = xmpDateMatch[1].trim();

        if (/reportlab/i.test(xmpString)) metadata.is_reportlab = true;
      }
    }

    // 4. Extract C2PA metadata / manifests
    if (/c2pa|claim_generator|c2pa\.manifest/i.test(raw)) {
      metadata.c2pa.has_c2pa = true;

      const claimGenMatch = raw.match(/claim_generator[":\s]+([^",\s}]+)/i) || raw.match(/c2pa:claimGenerator="([^"]+)"/i);
      if (claimGenMatch) metadata.c2pa.claim_generator = claimGenMatch[1];

      const manifestIdMatch = raw.match(/urn:c2pa:([a-zA-Z0-9_\-:]+)/i) || raw.match(/c2pa_manifest_id[":\s]+([^",\s}]+)/i);
      if (manifestIdMatch) metadata.c2pa.manifest_id = manifestIdMatch[0];
    }

    // 5. Extract Digital Signature / Certificate Authority info (e.g. SSL.com, Adobe, DocuSign)
    if (/\/Type\s*\/Sig/i.test(raw) || /certificate|x509|ssl\.com/i.test(raw)) {
      metadata.certificate.has_certificate = true;

      const certIssuerMatch = raw.match(/CN=([^,\n\r\/]+(?:CA|ICA|Certificate Authority|SSL\.com)[^\n\r\/]*)/i) ||
                              raw.match(/(SSL\.com[^\n\r()<>{}]*)/i) ||
                              raw.match(/(DigiCert[^\n\r()<>{}]*)/i) ||
                              raw.match(/(GlobalSign[^\n\r()<>{}]*)/i);
      if (certIssuerMatch) {
        metadata.certificate.issuer = certIssuerMatch[1].trim();
        metadata.c2pa.signature_issuer = metadata.certificate.issuer;
      }

      const byteRangeMatch = raw.match(/\/ByteRange\s*\[([0-9\s]+)\]/i);
      if (byteRangeMatch) {
        metadata.cryptographic_metadata.byte_range = byteRangeMatch[1].trim();
      }

      const filterMatch = raw.match(/\/Filter\s*\/([a-zA-Z0-9_]+)/i);
      if (filterMatch) metadata.cryptographic_metadata.filter = filterMatch[1];

      const subFilterMatch = raw.match(/\/SubFilter\s*\/([a-zA-Z0-9_\.]+)/i);
      if (subFilterMatch) metadata.cryptographic_metadata.sub_filter = subFilterMatch[1];
    }
  } catch (err) {
    logger.warn('[PDF Structure Parser] Metadata extraction warning:', err.message);
  }

  return metadata;
}

/**
 * Parses page structure and isolates visible page content streams.
 * Returns array of page text streams separated from metadata streams.
 * @param {Buffer} buffer
 * @returns {Array<{ page_number: number, raw_content_streams: string[] }>}
 */
function parsePdfPages(buffer) {
  const pages = [];
  try {
    const raw = buffer.toString('latin1');

    // 1. Locate all /Type /Page objects (excluding /Pages catalog node)
    // Matches patterns like "3 0 obj <</Type /Page ... /Contents 5 0 R ... >>"
    const pageObjRegex = /(\d+)\s+(\d+)\s+obj\s*<<([\s\S]*?\/Type\s*\/Page[\s\S]*?)>>/gi;
    let match;
    const pageMatches = [];

    while ((match = pageObjRegex.exec(raw)) !== null) {
      const objId = `${match[1]} ${match[2]}`;
      const dict = match[3];
      // Exclude /Type /Pages parent catalog node
      if (!/\/Type\s*\/Pages(?:\s|\/|>)/i.test(dict)) {
        pageMatches.push({ objId, dict });
      }
    }

    // 2. For each page object, resolve its /Contents reference(s)
    let pageNum = 1;
    for (const pageMatch of pageMatches) {
      const dict = pageMatch.dict;
      const contentRefMatch = dict.match(/\/Contents\s+(\d+)\s+(\d+)\s+R/i) || dict.match(/\/Contents\s*\[([\d\sR]+)\]/i);
      const streamChunks = [];

      if (contentRefMatch) {
        if (contentRefMatch[1] && contentRefMatch[2]) {
          // Single stream reference: "5 0 R"
          const streamObjId = `${contentRefMatch[1]} ${contentRefMatch[2]}`;
          const streamContent = extractObjectStream(raw, streamObjId);
          if (streamContent) streamChunks.push(streamContent);
        } else if (contentRefMatch[1]) {
          // Array of stream references: "[5 0 R 6 0 R]"
          const refs = contentRefMatch[1].match(/(\d+)\s+(\d+)\s+R/g) || [];
          for (const ref of refs) {
            const parts = ref.split(/\s+/);
            const streamContent = extractObjectStream(raw, `${parts[0]} ${parts[1]}`);
            if (streamContent) streamChunks.push(streamContent);
          }
        }
      }

      pages.push({
        page_number: pageNum++,
        raw_content_streams: streamChunks
      });
    }

    // If page object parsing returned empty, fallback to locating all decompressed text streams
    if (pages.length === 0) {
      const allStreams = extractAllContentStreams(raw);
      if (allStreams.length > 0) {
        pages.push({
          page_number: 1,
          raw_content_streams: allStreams
        });
      }
    }
  } catch (err) {
    logger.warn('[PDF Structure Parser] Page parsing warning:', err.message);
  }

  return pages;
}

/**
 * Extracts and inflates the stream of a specific PDF object ID.
 */
function extractObjectStream(pdfRaw, objId) {
  const [num, gen] = objId.split(/\s+/);
  const regex = new RegExp(`${num}\\s+${gen}\\s+obj[\\s\\S]*?stream\\r?\\n([\\s\\S]*?)\\r?\\nendstream`, 'i');
  const m = regex.exec(pdfRaw);
  if (!m) return null;

  const rawStream = m[1];
  const streamBuf = Buffer.from(rawStream, 'latin1');

  // Attempt zlib inflate
  try {
    return zlib.inflateSync(streamBuf).toString('latin1');
  } catch {
    try {
      return zlib.inflateRawSync(streamBuf).toString('latin1');
    } catch {
      return rawStream;
    }
  }
}

/**
 * Fallback to extract all non-metadata streams.
 */
function extractAllContentStreams(pdfRaw) {
  const streams = [];
  const streamRegex = /(\d+)\s+(\d+)\s+obj\s*<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/gi;
  let sm;

  while ((sm = streamRegex.exec(pdfRaw)) !== null) {
    const dict = sm[3];
    const rawStream = sm[4];

    // Exclude technical metadata / XMP / Font / C2PA streams
    if (/\/Type\s*\/Metadata/i.test(dict) ||
        /\/Subtype\s*\/XML/i.test(dict) ||
        /\/Type\s*\/Font/i.test(dict) ||
        /\/Type\s*\/C2PA/i.test(dict) ||
        /\/Type\s*\/Sig/i.test(dict) ||
        /<\?xpacket/i.test(rawStream)) {
      continue;
    }

    const streamBuf = Buffer.from(rawStream, 'latin1');
    try {
      streams.push(zlib.inflateSync(streamBuf).toString('latin1'));
    } catch {
      try {
        streams.push(zlib.inflateRawSync(streamBuf).toString('latin1'));
      } catch {
        streams.push(rawStream);
      }
    }
  }

  return streams;
}

/**
 * Helper to decode PDF literal / hex strings.
 */
function decodePdfString(str) {
  if (!str) return '';
  if (/^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0) {
    try {
      return Buffer.from(str, 'hex').toString('utf8');
    } catch {}
  }
  return str.replace(/\\([()\\])/g, '$1').trim();
}

/**
 * Helper to parse PDF date strings e.g. "D:20260818143000Z"
 */
function parsePdfDate(pdfDateStr) {
  if (!pdfDateStr) return null;
  const clean = pdfDateStr.replace(/^D:/, '').replace(/'/g, '');
  const m = clean.match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (m) {
    const year = m[1];
    const month = m[2];
    const day = m[3];
    const hour = m[4] || '00';
    const min = m[5] || '00';
    const sec = m[6] || '00';
    return `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
  }
  return pdfDateStr;
}

module.exports = {
  extractTechnicalMetadata,
  parsePdfPages
};

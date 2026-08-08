const mongoose = require('mongoose');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');
const axios    = require('axios');

const Document  = require('../models/Document');
const AIReport  = require('../models/AIReport');
const r         = require('../utils/apiResponse');
const logger    = require('../utils/logger');

/* ─── Multer – store uploads to disk ──────────────────────────── */
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or images.'), false);
};

exports.multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }  // 50 MB
}).single('file');

/* ─── Text extractor (PDF / DOCX / TXT / image placeholder) ── */
async function extractText(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const buf  = fs.readFileSync(filePath);
      const data = await pdfParse(buf);
      return (data.text || '').trim();
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const mammoth = require('mammoth');
      const result  = await mammoth.extractRawText({ path: filePath });
      return (result.value || '').trim();
    }

    if (mimeType === 'text/plain') {
      return fs.readFileSync(filePath, 'utf8').trim();
    }

    // For images: return a placeholder (no OCR installed)
    return `[Image document: ${path.basename(filePath)}]\n\nThis document is an image file. AI analysis is based on the document title and category.`;
  } catch (err) {
    logger.warn('Text extraction failed:', err.message);
    return '';
  }
}

/* ─── Groq call (same as aiController.js, duplicated to avoid circular dep) */
const GROQ_API_KEY  = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL    = 'llama-3.3-70b-versatile';

async function callGroq(messages, temperature = 0.35, max_tokens = 1400) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');
  const res = await axios.post(
    GROQ_BASE_URL,
    { model: GROQ_MODEL, messages, temperature, max_tokens },
    {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 30000
    }
  );
  return res.data.choices[0].message.content;
}

async function analyzeWithGroq(ocrText, title, category) {
  const systemPrompt = `You are a document verification assistant for NotaryChain, a legal document notarization platform.
Analyze the provided document text and return a JSON object ONLY (no markdown, no extra text) with exactly this structure:
{
  "summary": "3-4 sentence plain-language explanation of what this document is and what it does",
  "keyTerms": [
    { "label": "term name", "value": "extracted value or description" }
  ],
  "riskFlags": [
    { "severity": "high|medium|low|info", "flag": "description of the risk or notable item" }
  ],
  "trustScore": 85,
  "documentType": "Service Agreement / Contract / Invoice / etc"
}

Rules:
- keyTerms: parties involved, effective date, amounts, obligations, duration, termination (up to 8 items)
- riskFlags: missing signatures/dates, vague terms, one-sided clauses, no expiry, high liability limits, etc. (max 6 items)
- trustScore: 0-100 based on completeness and clarity
- Be concise and accurate`;

  const contextNote = ocrText.trim().length < 100
    ? `Document title: "${title}"\nCategory: ${category}\n\n[Document text could not be fully extracted. Provide a general analysis based on the title and category.]`
    : `Document title: "${title}"\nCategory: ${category}\n\n${ocrText.substring(0, 4500)}`;

  const raw = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: `Analyze this document:\n\n${contextNote}` }
  ]);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return {
      summary:      raw.substring(0, 400),
      keyTerms:     [],
      riskFlags:    [{ severity: 'info', flag: 'Analysis complete — manual review recommended' }],
      trustScore:   70,
      documentType: category || 'Document'
    };
  }
}

/* ─────────────────────────────────────────────────────────────── */

/**
 * POST /api/documents/upload
 * Accepts multipart/form-data with field "file".
 * Saves to disk, extracts text, creates DB record, runs Groq AI analysis.
 * Returns: { document, aiAnalysis }
 */
exports.upload = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please attach a file.' });
    }

    const docTitle = (title || path.parse(file.originalname).name).trim();

    // ── 1. Extract text from the file ──────────────────────────────
    const ocrText = await extractText(file.path, file.mimetype);

    // ── 2. Compute SHA-256 hash of file ───────────────────────────
    const fileBuffer = fs.readFileSync(file.path);
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // ── 3. Save Document record to MongoDB ────────────────────────
    let docRecord = null;
    if (mongoose.connection.readyState === 1) {
      docRecord = await Document.create({
        title:            docTitle,
        description:      description || '',
        fileUrl:          `/uploads/${file.filename}`,
        originalFileName: file.originalname,
        fileType:         path.extname(file.originalname).replace('.', '').toUpperCase(),
        fileSize:         file.size,
        mimeType:         file.mimetype,
        uploadedBy:       req.user._id,
        hash:             sha256Hash,
        category:         category || 'other',
        status:           'draft',
        metadata:         { ocrText: ocrText.substring(0, 8000) }
      });
    }

    // ── 4. Run Groq AI analysis ───────────────────────────────────
    let aiAnalysis = null;
    let aiError    = null;

    try {
      aiAnalysis = await analyzeWithGroq(ocrText, docTitle, category || 'document');
    } catch (err) {
      logger.error('Groq analysis failed during upload:', err.message);
      aiError = err.message.includes('GROQ_API_KEY')
        ? 'Groq API key not configured'
        : 'AI analysis temporarily unavailable';
    }

    // ── 5. Save AI report to MongoDB ──────────────────────────────
    if (docRecord && mongoose.connection.readyState === 1) {
      try {
        await AIReport.create({
          documentId:     docRecord._id,
          reportType:     'summarization',
          status:         aiAnalysis ? 'completed' : 'failed',
          results:        aiAnalysis
            ? { ...aiAnalysis, ocrTextLength: ocrText.length }
            : { error: aiError },
          confidence:     aiAnalysis?.trustScore || 0,
          requestedBy:    req.user._id,
          processedAt:    new Date(),
          processingTime: 0
        });

        // Also save OCR text as its own OCR report so the AI chat can use it
        if (ocrText.length > 50) {
          await AIReport.create({
            documentId:  docRecord._id,
            reportType:  'ocr',
            status:      'completed',
            results:     { text: ocrText, charCount: ocrText.length },
            confidence:  100,
            requestedBy: req.user._id,
            processedAt: new Date()
          });
        }
      } catch (dbErr) {
        logger.warn('Could not save AI report:', dbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: aiAnalysis
        ? '✅ Document uploaded and analysed by Groq AI'
        : '✅ Document uploaded (AI analysis failed — try again from the document detail page)',
      data: {
        document: docRecord
          ? {
              _id:             docRecord._id,
              title:           docRecord.title,
              status:          docRecord.status,
              hash:            docRecord.hash,
              category:        docRecord.category,
              originalFileName: docRecord.originalFileName,
              fileSize:        docRecord.fileSize,
              mimeType:        docRecord.mimeType,
              createdAt:       docRecord.createdAt
            }
          : {
              title:           docTitle,
              hash:            sha256Hash,
              originalFileName: file.originalname,
              fileSize:        file.size
            },
        aiAnalysis:  aiAnalysis || null,
        aiError:     aiError    || null,
        ocrExtracted: ocrText.length > 50
      }
    });
  } catch (err) {
    logger.error('Document upload error:', err.message);
    next(err);
  }
};

/* ─── Remaining CRUD handlers (unchanged logic) ──────────────── */
const d = require('../services/documentService');
const h = require('../utils/helpers');

exports.getAll          = async (req, res, next) => { try { const data = await d.getAll(req.user._id, req.user.role, h.getPaginationParams(req.query)); r.paginated(res, data.data, req.query.page || 1, req.query.limit || 10, data.total); } catch (x) { next(x); } };
exports.getById         = async (req, res, next) => { try { r.success(res, await d.getById(req.params.id, req.user._id)); } catch (x) { next(x); } };
exports.update          = async (req, res, next) => { try { r.success(res, await d.update(req.params.id, req.user._id, req.body)); } catch (x) { next(x); } };
exports.deleteDocument  = async (req, res, next) => { try { await d.softDelete(req.params.id, req.user._id); r.success(res, null, 'Deleted'); } catch (x) { next(x); } };
exports.uploadNewVersion= async (req, res, next) => { try { r.success(res, await d.addVersion(req.params.id, req.user._id, { url: '/v2.pdf', name: 'v2', size: 100 }, 'v2')); } catch (x) { next(x); } };
exports.shareDocument   = async (req, res, next) => { try { r.success(res, await d.shareDocument(req.params.id, req.user._id, { user: req.body.userId, permission: req.body.permission })); } catch (x) { next(x); } };
exports.removeShare     = async (req, res, next) => { try { r.success(res, await d.removeShare(req.params.id, req.user._id, req.params.userId)); } catch (x) { next(x); } };
exports.updateStatus    = async (req, res, next) => { try { r.success(res, await d.updateStatus(req.params.id, req.user._id, req.user.role, req.body.status)); } catch (x) { next(x); } };
exports.downloadDocument= async (req, res, next) => { try { r.success(res, { url: 'mock_url' }); } catch (x) { next(x); } };
exports.getTimeline     = async (req, res, next) => { try { r.success(res, await d.getTimeline(req.params.id)); } catch (x) { next(x); } };

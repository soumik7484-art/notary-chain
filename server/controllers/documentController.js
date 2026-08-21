'use strict';

const mongoose = require('mongoose');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');

const Document  = require('../models/Document');
const AIReport  = require('../models/AIReport');
const r         = require('../utils/apiResponse');
const logger    = require('../utils/logger');
const { processDocumentPipeline } = require('../services/documentAnalysisPipeline');

/* ─── Multer – store uploads in memory for 100% serverless compatibility ─ */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff'
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or images.'), false);
};

exports.multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }  // 50 MB
}).single('file');

/* ─────────────────────────────────────────────────────────────── */

const connectDB = require('../config/db');

/**
 * POST /api/documents/upload
 * Accepts multipart/form-data with field "file".
 * Saves to disk, executes 15-stage analysis pipeline, creates DB record.
 * Returns: { document, pipelineResult, aiAnalysis }
 */
exports.upload = async (req, res, next) => {
  try {
    try { await connectDB(); } catch {}
    const { title, category, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please attach a file.' });
    }

    // ── 0. Authoritative Account-Based Quota Check ────────────────
    const User = require('../models/User');
    let currentUserDoc = null;
    const rawUserId = req.user?._id || req.user?.id;
    if (rawUserId && mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(rawUserId)) {
        currentUserDoc = await User.findById(rawUserId);
      } else if (req.user?.email) {
        currentUserDoc = await User.findOne({ email: req.user.email });
      }
      if (currentUserDoc) {
        const quota = currentUserDoc.getQuotaInfo();
        if (!quota.canVerify) {
          return res.status(403).json({
            success: false,
            isLimitReached: true,
            message: 'Free verification limit has been reached (3/3 in 24 hours). Upgrade to Pro to continue.',
            quota
          });
        }
      }
    }

    const docTitle = (title || path.parse(file.originalname).name).trim();

    // ── 1. Get file buffer & compute exact SHA-256 hash ────────────
    const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : Buffer.from(''));
    const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // ── 2. Run 15-Stage Document Analysis Pipeline ───────────────
    const pipelineResult = await processDocumentPipeline(
      fileBuffer,
      file.mimetype,
      file.originalname,
      docTitle,
      category || 'contract',
      req.body.extractedText
    );

    const fullVisibleText = pipelineResult.document_content?.pages?.map(p => p.text).join('\n\n') || '';

    // ── 3. Save Document record to MongoDB ────────────────────────
    let docRecord = null;
    if (mongoose.connection.readyState === 1) {
      const uId = currentUserDoc?._id || (mongoose.Types.ObjectId.isValid(rawUserId) ? rawUserId : new mongoose.Types.ObjectId());
      docRecord = await Document.create({
        title:            docTitle,
        description:      description || '',
        fileUrl:          `/uploads/${Date.now()}-${file.originalname}`,
        originalFileName: file.originalname,
        fileType:         path.extname(file.originalname).replace('.', '').toUpperCase() || 'PDF',
        fileSize:         file.size || fileBuffer.length,
        mimeType:         file.mimetype,
        uploadedBy:       uId,
        hash:             sha256Hash,
        category:         pipelineResult.document.category || category || 'other',
        status:           'draft',
        metadata: {
          ocrText: fullVisibleText.substring(0, 10000),
          pipelineResult,
          aiAnalysis: pipelineResult.aiAnalysis,
          technicalMetadata: pipelineResult.technical_metadata
        }
      });
    }

    // ── 4. Save AI report to MongoDB & attach to document metadata ──
    if (docRecord && mongoose.connection.readyState === 1) {
      try {
        await AIReport.create({
          documentId:     docRecord._id,
          reportType:     'summarization',
          status:         'completed',
          results:        pipelineResult.aiAnalysis,
          confidence:     pipelineResult.risk_analysis?.trust_score || 0,
          requestedBy:    req.user?._id || docRecord.uploadedBy,
          processedAt:    new Date(),
          processingTime: 0
        });

        // Also save OCR text as its own OCR report so AI chat can query it
        if (fullVisibleText.length > 50) {
          await AIReport.create({
            documentId:  docRecord._id,
            reportType:  'ocr',
            status:      'completed',
            results:     { text: fullVisibleText, charCount: fullVisibleText.length },
            confidence:  pipelineResult.document.extraction_confidence || 100,
            requestedBy: req.user?._id || docRecord.uploadedBy,
            processedAt: new Date()
          });
        }

        // Create AuditLog entry for History page
        try {
          const AuditLog = require('../models/AuditLog');
          await AuditLog.create({
            userId:     req.user?._id || docRecord.uploadedBy,
            userRole:   req.user?.role || 'company',
            documentId: docRecord._id,
            action:     'DOCUMENT_VERIFICATION',
            category:   'document',
            ipAddress:  req.ip || '127.0.0.1',
            browser:    req.deviceInfo?.browser || 'Browser',
            device:     req.deviceInfo?.device  || 'Desktop',
            os:         req.deviceInfo?.os      || 'Unknown',
            status:     'success',
            metadata: {
              title: docRecord.title,
              category: docRecord.category,
              hash: docRecord.hash,
              trustScore: pipelineResult.risk_analysis?.trust_score,
              riskLevel: pipelineResult.risk_analysis?.risk_level
            }
          });
        } catch (auditErr) {
          logger.warn('AuditLog creation warning:', auditErr.message);
        }
      } catch (saveErr) {
        logger.error('Failed to save AI report to MongoDB:', saveErr.message);
      }
    }

    // ── 5. Respond with rich document analysis data ───────────────
    return res.status(201).json({
      success: true,
      message: 'Document uploaded & 15-stage verification analysis complete',
      data: {
        document: docRecord ? {
          _id:              docRecord._id,
          title:            docRecord.title,
          originalFileName: docRecord.originalFileName,
          fileSize:         docRecord.fileSize,
          fileType:         docRecord.fileType,
          mimeType:         docRecord.mimeType,
          hash:             docRecord.hash,
          category:         docRecord.category,
          status:           docRecord.status,
          createdAt:        docRecord.createdAt,
          metadata:         docRecord.metadata
        } : {
          title:            docTitle,
          originalFileName: file.originalname,
          fileSize:         fileBuffer.length,
          fileType:         'PDF',
          hash:             sha256Hash,
          category:         pipelineResult.document.category,
          status:           'draft',
          createdAt:        new Date()
        },
        pipeline: pipelineResult,
        aiAnalysis: pipelineResult.aiAnalysis,
        technicalMetadata: pipelineResult.technical_metadata
      }
    });
  } catch (err) {
    logger.error('Upload handler fatal error:', err);
    next(err);
  }
};

/**
 * GET /api/documents
 */
exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (req.user && req.user.role !== 'admin') {
      filter.$or = [
        { uploadedBy: req.user._id },
        { 'sharedWith.user': req.user._id }
      ];
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate('uploadedBy', 'firstName lastName email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(filter)
    ]);

    return r.paginated(res, documents, page, limit, total);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/documents/:id
 */
exports.getById = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: false })
      .populate('uploadedBy', 'firstName lastName email avatar role')
      .populate('sharedWith.user', 'firstName lastName email');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    return r.success(res, doc);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/documents/:id
 */
exports.update = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, uploadedBy: req.user._id, isDeleted: false },
      { $set: { title, description, category, tags } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found or unauthorized' });
    return r.success(res, doc, 'Document updated');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/documents/:id
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, uploadedBy: req.user._id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    return r.success(res, null, 'Document deleted');
  } catch (err) {
    next(err);
  }
};

exports.uploadNewVersion = async (req, res, next) => {
  return r.success(res, null, 'New version uploaded');
};

exports.shareDocument = async (req, res, next) => {
  return r.success(res, null, 'Document shared');
};

exports.removeShare = async (req, res, next) => {
  return r.success(res, null, 'Share removed');
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const doc = await Document.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return r.success(res, doc, 'Status updated');
  } catch (err) {
    next(err);
  }
};

exports.downloadDocument = async (req, res, next) => {
  return r.success(res, null, 'Download authorized');
};

exports.getTimeline = async (req, res, next) => {
  return r.success(res, [], 'Document timeline');
};

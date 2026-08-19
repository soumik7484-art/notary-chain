const fs = require('fs');
const path = require('path');
const d = require('../services/documentService');
const r = require('../utils/apiResponse');
const h = require('../utils/helpers');
const encryptionService = require('../services/encryptionService');
const fraudDetectionService = require('../services/ai/fraudDetectionService');
const auditLogger = require('../middleware/auditLogger');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError.BadRequestError('No document file uploaded. Please attach a PDF, DOCX, or image file.');
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = encryptionService.hashData(fileBuffer);

    const docData = {
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      category: req.body.category || 'General',
      fileUrl: `/uploads/${req.file.filename}`,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      hash: fileHash,
      uploadedBy: req.user._id,
      status: req.body.status || 'pending_verification',
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : []
    };

    const doc = await d.create(docData);

    // Audit logging
    await auditLogger.auditAction(
      req.user._id,
      'DOCUMENT_UPLOADED',
      'document',
      doc._id,
      req.deviceInfo,
      { fileName: doc.originalFileName, hash: fileHash, fileSize: doc.fileSize }
    );

    // Run background AI Fraud Analysis
    try {
      await fraudDetectionService.analyzeDocument(doc._id, fileBuffer, doc.originalFileName);
    } catch (aiErr) {
      console.warn('AI Fraud analysis warning:', aiErr.message);
    }

    return r.success(res, doc, 'Document uploaded and cryptographically hashed successfully', 201);
  } catch (x) {
    next(x);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const params = h.getPaginationParams(req.query);
    const data = await d.getAll(req.user._id, req.user.role, {
      ...params,
      search: req.query.search,
      status: req.query.status,
      category: req.query.category
    });
    r.paginated(res, data.data, req.query.page || 1, req.query.limit || 10, data.total);
  } catch (x) {
    next(x);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const doc = await d.getById(req.params.id, req.user._id, req.user.role);
    r.success(res, doc);
  } catch (x) {
    next(x);
  }
};

exports.update = async (req, res, next) => {
  try {
    const doc = await d.update(req.params.id, req.user._id, req.user.role, req.body);
    await auditLogger.auditAction(req.user._id, 'DOCUMENT_UPDATED', 'document', doc._id, req.deviceInfo);
    r.success(res, doc, 'Document metadata updated');
  } catch (x) {
    next(x);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await d.softDelete(req.params.id, req.user._id, req.user.role);
    await auditLogger.auditAction(req.user._id, 'DOCUMENT_DELETED', 'document', req.params.id, req.deviceInfo);
    r.success(res, null, 'Document deleted successfully');
  } catch (x) {
    next(x);
  }
};

exports.uploadNewVersion = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError.BadRequestError('No new file uploaded for versioning');
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = encryptionService.hashData(fileBuffer);

    const versionData = {
      fileUrl: `/uploads/${req.file.filename}`,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      hash: fileHash
    };

    const doc = await d.addVersion(req.params.id, req.user._id, versionData, req.body.changeNotes);
    await auditLogger.auditAction(req.user._id, 'DOCUMENT_VERSION_ADDED', 'document', doc._id, req.deviceInfo, { version: doc.currentVersion });

    r.success(res, doc, `New document version v${doc.currentVersion} uploaded successfully`);
  } catch (x) {
    next(x);
  }
};

exports.shareDocument = async (req, res, next) => {
  try {
    const doc = await d.shareDocument(req.params.id, req.user._id, {
      userId: req.body.userId,
      permission: req.body.permission
    });
    await auditLogger.auditAction(req.user._id, 'DOCUMENT_SHARED', 'document', doc._id, req.deviceInfo, { sharedWith: req.body.userId });
    r.success(res, doc, 'Document access shared successfully');
  } catch (x) {
    next(x);
  }
};

exports.removeShare = async (req, res, next) => {
  try {
    const doc = await d.removeShare(req.params.id, req.user._id, req.params.userId);
    await auditLogger.auditAction(req.user._id, 'DOCUMENT_UNSHARED', 'document', doc._id, req.deviceInfo, { removedUser: req.params.userId });
    r.success(res, doc, 'Document access share revoked');
  } catch (x) {
    next(x);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const doc = await d.updateStatus(req.params.id, req.user._id, req.user.role, req.body.status, req.body.reviewNotes);
    await auditLogger.auditAction(req.user._id, 'DOCUMENT_STATUS_UPDATED', 'document', doc._id, req.deviceInfo, { newStatus: req.body.status });
    r.success(res, doc, `Document status updated to ${req.body.status}`);
  } catch (x) {
    next(x);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const doc = await d.getById(req.params.id, req.user._id, req.user.role);

    // Resolve file path safely
    const filename = path.basename(doc.fileUrl);
    const uploadDir = path.resolve(__dirname, '..', env.UPLOAD_PATH || 'uploads');
    const fullPath = path.join(uploadDir, filename);

    if (!fs.existsSync(fullPath)) {
      throw new ApiError.NotFoundError('Physical file not found on storage server');
    }

    await auditLogger.auditAction(req.user._id, 'DOCUMENT_DOWNLOADED', 'document', doc._id, req.deviceInfo);
    return res.download(fullPath, doc.originalFileName);
  } catch (x) {
    next(x);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const timeline = await d.getTimeline(req.params.id);
    r.success(res, timeline);
  } catch (x) {
    next(x);
  }
};

exports.verifyHash = async (req, res, next) => {
  try {
    const { hash } = req.params;
    const doc = await d.getByHash(hash);
    if (!doc) {
      return r.success(res, { verified: false, message: 'No document found matching this cryptographic hash' });
    }
    r.success(res, {
      verified: true,
      document: {
        id: doc._id,
        uniqueDocId: doc.uniqueDocId,
        title: doc.title,
        status: doc.status,
        uploadedAt: doc.createdAt,
        notarizedAt: doc.notarizedAt,
        uploader: doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : 'System'
      }
    });
  } catch (x) {
    next(x);
  }
};

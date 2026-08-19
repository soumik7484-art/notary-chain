const VerificationRequest = require('../models/VerificationRequest');
const Document = require('../models/Document');
const r = require('../utils/apiResponse');
const auditLogger = require('../middleware/auditLogger');
const blockchainService = require('../services/blockchainService');

exports.createRequest = async (req, res, next) => {
  try {
    const { documentId, notes, verificationType } = req.body;
    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const request = await VerificationRequest.create({
      documentId,
      requestedBy: req.user._id,
      notes,
      verificationType: verificationType || 'standard_notarization',
      status: 'pending'
    });

    // Update doc status to pending_verification
    doc.status = 'pending_verification';
    await doc.save();

    await auditLogger.auditAction(req.user._id, 'VERIFICATION_REQUEST_CREATED', 'document', doc._id, req.deviceInfo);

    r.success(res, request, 'Verification request submitted successfully', 201);
  } catch (x) {
    next(x);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'company' || req.user.role === 'user') {
      query.requestedBy = req.user._id;
    }
    const requests = await VerificationRequest.find(query)
      .populate('documentId', 'title originalFileName hash status currentVersion')
      .populate('requestedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    r.success(res, requests);
  } catch (x) {
    next(x);
  }
};

exports.getQueue = async (req, res, next) => {
  try {
    const requests = await VerificationRequest.find({
      $or: [
        { assignedTo: req.user._id },
        { status: { $in: ['pending', 'assigned', 'under_review'] } }
      ]
    })
      .populate('documentId', 'title originalFileName hash status category')
      .populate('requestedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    r.success(res, requests);
  } catch (x) {
    next(x);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const request = await VerificationRequest.findById(req.params.id)
      .populate('documentId')
      .populate('requestedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    r.success(res, request);
  } catch (x) {
    next(x);
  }
};

exports.assignReviewer = async (req, res, next) => {
  try {
    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.userId, status: 'assigned' },
      { new: true }
    );

    if (request && request.documentId) {
      await Document.findByIdAndUpdate(request.documentId, { assignedReviewer: req.body.userId, status: 'under_review' });
    }

    await auditLogger.auditAction(req.user._id, 'VERIFICATION_REQUEST_ASSIGNED', 'document', request.documentId, req.deviceInfo, { assignedTo: req.body.userId });

    r.success(res, request, 'Reviewer assigned successfully');
  } catch (x) {
    next(x);
  }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewNotes: notes, reviewedAt: Date.now() },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    // Sync status back to Document model
    const docStatus = status === 'approved' ? 'notarized' : (status === 'rejected' ? 'rejected' : 'under_review');
    const doc = await Document.findById(request.documentId);

    if (doc) {
      doc.status = docStatus;
      doc.reviewNotes = notes;
      if (docStatus === 'notarized') {
        doc.notarizedAt = new Date();

        // Optional Blockchain Anchor if hash available
        if (doc.hash) {
          try {
            const bcResult = await blockchainService.storeDocumentHash(doc.hash, doc.uniqueDocId || doc._id.toString());
            doc.metadata = { ...(doc.metadata || {}), blockchainTx: bcResult };
          } catch (bcErr) {
            console.warn('Blockchain anchor deferred or failed:', bcErr.message);
          }
        }
      }
      await doc.save();
    }

    await auditLogger.auditAction(req.user._id, 'VERIFICATION_REVIEW_SUBMITTED', 'document', request.documentId, req.deviceInfo, { status, notes });

    r.success(res, request, `Verification review submitted (${status})`);
  } catch (x) {
    next(x);
  }
};

const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/apiError');

exports.create = async (docData) => {
  return await Document.create(docData);
};

exports.getById = async (id, userId, role) => {
  const doc = await Document.findById(id).populate('uploadedBy sharedWith.user assignedReviewer', 'firstName lastName email role');
  if (!doc || doc.isDeleted) throw new NotFoundError('Document not found');

  const isOwner = doc.uploadedBy && doc.uploadedBy._id.toString() === userId.toString();
  const isShared = doc.sharedWith && doc.sharedWith.some(s => s.user && s.user._id.toString() === userId.toString());
  const isPrivileged = role === 'admin' || role === 'notary' || role === 'bank';

  if (!isOwner && !isShared && !isPrivileged) {
    throw new ForbiddenError('You do not have permission to access this document');
  }

  return doc;
};

exports.getByHash = async (hash) => {
  if (!hash) throw new BadRequestError('Hash is required');
  const doc = await Document.findOne({ hash, isDeleted: false }).populate('uploadedBy', 'firstName lastName email');
  return doc;
};

exports.getAll = async (userId, role, opts = {}) => {
  const { page = 1, limit = 10, sort = 'createdAt', order = -1, search, status, category } = opts;
  let query = { isDeleted: false };

  // Role-based visibility
  if (role === 'company' || role === 'user') {
    query.$or = [{ uploadedBy: userId }, { 'sharedWith.user': userId }];
  } else if (role === 'notary') {
    query.$or = [
      { status: { $in: ['pending_verification', 'under_review', 'notarized', 'approved'] } },
      { uploadedBy: userId },
      { assignedReviewer: userId }
    ];
  } else if (role === 'bank') {
    query.$or = [
      { status: { $in: ['approved', 'notarized'] } },
      { uploadedBy: userId },
      { 'sharedWith.user': userId }
    ];
  }
  // Admin sees all non-deleted documents

  if (status) query.status = status;
  if (category) query.category = category;

  if (search) {
    query.$or = (query.$or || []).concat([
      { title: { $regex: search, $options: 'i' } },
      { originalFileName: { $regex: search, $options: 'i' } },
      { hash: { $regex: search, $options: 'i' } }
    ]);
  }

  const sortOrder = order === 'asc' || order === 1 ? 1 : -1;
  const skip = (Math.max(1, page) - 1) * limit;

  const total = await Document.countDocuments(query);
  const data = await Document.find(query)
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(limit)
    .populate('uploadedBy', 'firstName lastName email')
    .populate('assignedReviewer', 'firstName lastName email');

  return { data, total };
};

exports.update = async (id, userId, role, updates) => {
  const doc = await Document.findById(id);
  if (!doc || doc.isDeleted) throw new NotFoundError('Document not found');

  const isOwner = doc.uploadedBy && doc.uploadedBy.toString() === userId.toString();
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Only document owner or admin can update metadata');
  }

  const allowedFields = ['title', 'description', 'category', 'tags'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) doc[field] = updates[field];
  });

  return await doc.save();
};

exports.softDelete = async (id, userId, role) => {
  const doc = await Document.findById(id);
  if (!doc || doc.isDeleted) throw new NotFoundError('Document not found');

  const isOwner = doc.uploadedBy && doc.uploadedBy.toString() === userId.toString();
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Only document owner or admin can delete this document');
  }

  doc.isDeleted = true;
  doc.deletedAt = new Date();
  doc.deletedBy = userId;

  return await doc.save();
};

exports.addVersion = async (id, userId, fileData, notes) => {
  const doc = await Document.findById(id);
  if (!doc || doc.isDeleted) throw new NotFoundError('Document not found');

  const isOwner = doc.uploadedBy && doc.uploadedBy.toString() === userId.toString();
  if (!isOwner) throw new ForbiddenError('Only owner can upload a new version');

  // Archive current version
  doc.versions.push({
    versionNumber: doc.currentVersion,
    fileUrl: doc.fileUrl,
    fileName: doc.originalFileName,
    fileSize: doc.fileSize,
    uploadedAt: doc.updatedAt || doc.createdAt,
    uploadedBy: userId,
    changeNotes: notes || `Version ${doc.currentVersion} archived`
  });

  doc.currentVersion += 1;
  doc.fileUrl = fileData.fileUrl;
  doc.originalFileName = fileData.originalFileName;
  doc.fileSize = fileData.fileSize;
  doc.mimeType = fileData.mimeType;
  if (fileData.hash) doc.hash = fileData.hash;

  return await doc.save();
};

exports.shareDocument = async (id, ownerId, shareData) => {
  const doc = await Document.findOne({ _id: id, uploadedBy: ownerId, isDeleted: false });
  if (!doc) throw new NotFoundError('Document not found or you are not owner');

  const existingShare = doc.sharedWith.find(s => s.user.toString() === shareData.userId.toString());
  if (existingShare) {
    existingShare.permission = shareData.permission || 'read';
    existingShare.sharedAt = new Date();
  } else {
    doc.sharedWith.push({
      user: shareData.userId,
      permission: shareData.permission || 'read',
      sharedAt: new Date(),
      sharedBy: ownerId
    });
  }

  return await doc.save();
};

exports.removeShare = async (id, ownerId, targetUserId) => {
  const doc = await Document.findOne({ _id: id, uploadedBy: ownerId, isDeleted: false });
  if (!doc) throw new NotFoundError('Document not found or you are not owner');

  doc.sharedWith = doc.sharedWith.filter(s => s.user.toString() !== targetUserId.toString());
  return await doc.save();
};

exports.updateStatus = async (id, userId, role, status, notes) => {
  const doc = await Document.findById(id);
  if (!doc || doc.isDeleted) throw new NotFoundError('Document not found');

  // Status transition checks
  const isNotaryOrAdmin = role === 'notary' || role === 'admin' || role === 'bank';
  if (!isNotaryOrAdmin && doc.uploadedBy.toString() !== userId.toString()) {
    throw new ForbiddenError('Unauthorized to update document status');
  }

  doc.status = status;
  if (notes) doc.reviewNotes = notes;
  if (status === 'notarized' || status === 'approved') {
    doc.notarizedAt = new Date();
  }

  return await doc.save();
};

exports.getTimeline = async (id) => {
  return await AuditLog.find({ documentId: id }).sort({ createdAt: -1 });
};

exports.getStats = async (userId, role) => {
  let matchQuery = { isDeleted: false };
  if (role === 'company' || role === 'user') {
    matchQuery.uploadedBy = userId;
  }

  const statusStats = await Document.aggregate([
    { $match: matchQuery },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const statsObj = { total: 0, draft: 0, pending_verification: 0, under_review: 0, approved: 0, rejected: 0, notarized: 0 };
  statusStats.forEach(s => {
    if (s._id) {
      statsObj[s._id] = s.count;
      statsObj.total += s.count;
    }
  });

  return statsObj;
};

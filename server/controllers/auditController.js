const a = require('../services/auditService');
const r = require('../utils/apiResponse');
const h = require('../utils/helpers');

exports.getAll = async (req, res, next) => {
  try {
    const params = h.getPaginationParams(req.query);
    if (req.user && req.user.role !== 'admin') {
      params.userId = req.user._id || req.user.id;
    }
    const d = await a.getLogs(params);
    r.paginated(res, d.data, req.query.page || 1, req.query.limit || 10, d.total);
  } catch (x) { next(x); }
};
exports.getByUser = async (req, res, next) => { try { const d = await a.getLogsByUser(req.params.userId, h.getPaginationParams(req.query)); r.paginated(res, d.data, 1, 10, d.total); } catch (x) { next(x); } };
exports.getByDocument = async (req, res, next) => { try { const d = await a.getLogsByDocument(req.params.documentId, h.getPaginationParams(req.query)); r.paginated(res, d.data, 1, 10, d.total); } catch (x) { next(x); } };
exports.getStats = async (req, res, next) => { try { r.success(res, await a.getLogStats()); } catch (x) { next(x); } };

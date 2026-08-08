const router = require('express').Router();
const c = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { extractDeviceInfo } = require('../middleware/deviceInfo');

router.use(protect);

// ─── Upload: use multer middleware from documentController ────────────────────
router.post('/upload', uploadLimiter, extractDeviceInfo, (req, res, next) => {
  c.multerUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, c.upload);

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.delete('/:id', extractDeviceInfo, c.deleteDocument);
router.post('/:id/version', c.uploadNewVersion);
router.post('/:id/share', c.shareDocument);
router.delete('/:id/share/:userId', c.removeShare);
router.patch('/:id/status', extractDeviceInfo, c.updateStatus);
router.get('/:id/download', c.downloadDocument);
router.get('/:id/timeline', c.getTimeline);

module.exports = router;

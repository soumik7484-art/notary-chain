const router = require('express').Router();
const c = require('../controllers/documentController');
const v = require('../middleware/validation').validate;
const s = require('../utils/validators');
const { protect } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { extractDeviceInfo } = require('../middleware/deviceInfo');
const upload = require('../middleware/upload');

// Public verification route by hash
router.get('/verify-hash/:hash', c.verifyHash);

router.use(protect);
router.post('/upload', uploadLimiter, upload.single('file'), extractDeviceInfo, c.upload);
router.get('/', v(s.paginationSchema, 'query'), c.getAll);
router.get('/:id', c.getById);
router.put('/:id', v(s.documentUpdateSchema), c.update);
router.delete('/:id', extractDeviceInfo, c.deleteDocument);
router.post('/:id/version', upload.single('file'), c.uploadNewVersion);
router.post('/:id/share', v(s.documentShareSchema), c.shareDocument);
router.delete('/:id/share/:userId', c.removeShare);
router.patch('/:id/status', v(s.documentStatusSchema), extractDeviceInfo, c.updateStatus);
router.get('/:id/download', c.downloadDocument);
router.get('/:id/timeline', c.getTimeline);

module.exports = router;

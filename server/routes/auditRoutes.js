const router = require('express').Router();
const c = require('../controllers/auditController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

router.use(protect);
router.get('/', c.getAll);
router.get('/user/:userId', authorize('admin'), c.getByUser);
router.get('/document/:documentId', c.getByDocument);
router.get('/stats', authorize('admin'), c.getStats);

module.exports = router;

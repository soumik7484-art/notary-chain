const router = require('express').Router();
const c = require('../controllers/userController');
const v = require('../middleware/validation').validate;
const s = require('../utils/validators');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/profile', c.getProfile);
router.get('/quota', c.getQuota);
router.post('/upgrade-plan', c.upgradePlan);
router.post('/reset-quota', c.resetQuota);
router.put('/profile', c.updateProfile);
router.put('/change-password', v(s.changePasswordSchema), c.changePassword);
router.delete('/account', c.deleteAccount);
router.get('/activity', c.getActivityTimeline);

module.exports = router;

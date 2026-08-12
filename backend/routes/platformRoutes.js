const express = require('express');
const router = express.Router();
const {
  inviteBuilder,
  listBuilders,
  getBuilder,
  resendBuilderInvite,
  suspendBuilder,
  getPlatformAuditLogs,
} = require('../controllers/platformController');
const { protect, platformStaffOnly, platformAdminOnly } = require('../middleware/authMiddleware');

router.use(protect, platformStaffOnly);

router.get('/builders', listBuilders);
router.get('/builders/:id', getBuilder);
router.post('/builders', platformAdminOnly, inviteBuilder);
router.post('/builders/:id/resend-invite', platformAdminOnly, resendBuilderInvite);
router.post('/builders/:id/suspend', platformAdminOnly, suspendBuilder);
router.get('/audit-logs', getPlatformAuditLogs);

module.exports = router;

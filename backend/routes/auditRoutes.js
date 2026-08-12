const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

router.get('/', protect, attachTenantScope, requireBuilderScope, adminOnly, getAuditLogs);

module.exports = router;

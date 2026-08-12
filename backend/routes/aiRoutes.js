const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');
const { runCapability } = require('../controllers/aiController');

router.post('/:capability', protect, attachTenantScope, requireBuilderScope, runCapability);

module.exports = router;

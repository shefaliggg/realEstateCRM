const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');
const { getMyBuilder, updateMyBuilder } = require('../controllers/builderController');

router.use(protect, attachTenantScope, requireBuilderScope, requirePermission('manage_users'));

router.route('/me').get(getMyBuilder).put(updateMyBuilder);

module.exports = router;

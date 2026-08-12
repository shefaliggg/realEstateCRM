const express = require('express');
const router = express.Router();
const { protect, requirePermission } = require('../middleware/authMiddleware');
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware');
const { getRoles, updateRolePermissions } = require('../controllers/roleController');

router.use(protect, attachTenantScope, requireBuilderScope, requirePermission('manage_users'));

router.get('/', getRoles);
router.put('/:key', updateRolePermissions);

module.exports = router;

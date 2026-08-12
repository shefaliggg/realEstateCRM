const express = require('express')
const router = express.Router()
const { protect, blockExternalUsers, requirePermission } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { getAdminSummary } = require('../controllers/dashboardController')

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers, requirePermission('module:Dashboard'))

router.get('/admin-summary', getAdminSummary)

module.exports = router

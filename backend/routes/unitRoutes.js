const express = require('express')
const router = express.Router({ mergeParams: true }) // inherits :projectId from parent
const { protect, requirePermission, blockExternalUsers } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { projectImageUpload } = require('../middleware/uploadMiddleware')
const { getUnits, getUnitById, createUnit, updateUnit, deleteUnit, bulkCreateUnits, bulkUpdateUnits } = require('../controllers/unitController')

const unitDocUpload = projectImageUpload.fields([
  { name: 'floorPlan', maxCount: 1 },
  { name: 'priceSheet', maxCount: 1 },
])

// Mounted at /api/projects/:projectId/units
router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers)

router.route('/').get(getUnits).post(requirePermission('manage_inventory'), unitDocUpload, createUnit)
router.post('/bulk-create', requirePermission('manage_inventory'), bulkCreateUnits)
router.post('/bulk-update', requirePermission('manage_inventory'), bulkUpdateUnits)
router.route('/:id').get(getUnitById).put(requirePermission('manage_inventory'), unitDocUpload, updateUnit).delete(requirePermission('manage_inventory'), deleteUnit)

module.exports = router

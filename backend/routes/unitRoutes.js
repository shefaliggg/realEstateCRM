const express = require('express')
const router = express.Router({ mergeParams: true }) // inherits :projectId from parent
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { projectImageUpload } = require('../middleware/uploadMiddleware')
const { getUnits, getUnitById, createUnit, updateUnit, deleteUnit, bulkCreateUnits, bulkUpdateUnits } = require('../controllers/unitController')

const unitDocUpload = projectImageUpload.fields([
  { name: 'floorPlan', maxCount: 1 },
  { name: 'priceSheet', maxCount: 1 },
])

// Mounted at /api/projects/:projectId/units
router.route('/').get(protect, getUnits).post(protect, adminOnly, unitDocUpload, createUnit)
router.post('/bulk-create', protect, adminOnly, bulkCreateUnits)
router.post('/bulk-update', protect, adminOnly, bulkUpdateUnits)
router.route('/:id').get(protect, getUnitById).put(protect, adminOnly, unitDocUpload, updateUnit).delete(protect, adminOnly, deleteUnit)

module.exports = router

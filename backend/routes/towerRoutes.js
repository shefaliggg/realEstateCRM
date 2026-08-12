const express = require('express')
const router = express.Router({ mergeParams: true })
const { protect, requirePermission, blockExternalUsers } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { projectImageUpload } = require('../middleware/uploadMiddleware')
const { getTowers, getTowerById, createTower, updateTower, deleteTower } = require('../controllers/towerController')

const towerDocUpload = projectImageUpload.fields([
  { name: 'floorPlans', maxCount: 8 },
  { name: 'towerLayout', maxCount: 1 },
  { name: 'elevationDrawing', maxCount: 1 },
])

// Mounted at /api/projects/:projectId/towers
router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers)

router.route('/').get(getTowers).post(requirePermission('manage_inventory'), towerDocUpload, createTower)
router.route('/:id').get(getTowerById).put(requirePermission('manage_inventory'), towerDocUpload, updateTower).delete(requirePermission('manage_inventory'), deleteTower)

module.exports = router

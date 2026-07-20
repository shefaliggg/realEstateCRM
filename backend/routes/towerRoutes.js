const express = require('express')
const router = express.Router({ mergeParams: true })
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { projectImageUpload } = require('../middleware/uploadMiddleware')
const { getTowers, getTowerById, createTower, updateTower, deleteTower } = require('../controllers/towerController')

const towerDocUpload = projectImageUpload.fields([
  { name: 'floorPlans', maxCount: 8 },
  { name: 'towerLayout', maxCount: 1 },
  { name: 'elevationDrawing', maxCount: 1 },
])

// Mounted at /api/projects/:projectId/towers
router.route('/').get(protect, getTowers).post(protect, adminOnly, towerDocUpload, createTower)
router.route('/:id').get(protect, getTowerById).put(protect, adminOnly, towerDocUpload, updateTower).delete(protect, adminOnly, deleteTower)

module.exports = router

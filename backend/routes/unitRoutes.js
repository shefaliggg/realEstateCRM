const express = require('express')
const router = express.Router({ mergeParams: true }) // inherits :projectId from parent
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { getUnits, getUnitById, createUnit, updateUnit, deleteUnit } = require('../controllers/unitController')

// Mounted at /api/projects/:projectId/units
router.route('/').get(protect, getUnits).post(protect, adminOnly, createUnit)
router.route('/:id').get(protect, getUnitById).put(protect, adminOnly, updateUnit).delete(protect, adminOnly, deleteUnit)

module.exports = router

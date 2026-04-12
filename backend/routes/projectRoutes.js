const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController')

router.route('/').get(protect, getProjects).post(protect, adminOnly, createProject)
router.route('/:id').get(protect, getProjectById).put(protect, adminOnly, updateProject).delete(protect, adminOnly, deleteProject)

module.exports = router

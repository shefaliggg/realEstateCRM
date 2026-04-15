const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { projectImageUpload } = require('../middleware/uploadMiddleware')
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController')

const projectMediaUpload = projectImageUpload.fields([
	{ name: 'images', maxCount: 8 },
	{ name: 'videos', maxCount: 4 },
])

router.route('/').get(protect, getProjects).post(protect, adminOnly, projectMediaUpload, createProject)
router.route('/:id').get(protect, getProjectById).put(protect, adminOnly, projectMediaUpload, updateProject).delete(protect, adminOnly, deleteProject)

module.exports = router

const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { projectImageUpload } = require('../middleware/uploadMiddleware')
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController')

const projectMediaUpload = projectImageUpload.fields([
	{ name: 'images', maxCount: 8 },
	{ name: 'videos', maxCount: 4 },
	{ name: 'logo', maxCount: 1 },
	{ name: 'coverImage', maxCount: 1 },
	{ name: 'floorPlanImages', maxCount: 8 },
	{ name: 'masterPlanImage', maxCount: 1 },
	{ name: 'constructionProgressPhotos', maxCount: 12 },
	{ name: 'reraCertificate', maxCount: 1 },
	{ name: 'brochure', maxCount: 1 },
	{ name: 'priceSheet', maxCount: 1 },
	{ name: 'paymentPlan', maxCount: 1 },
	{ name: 'occupancyCertificate', maxCount: 1 },
	{ name: 'completionCertificate', maxCount: 1 },
	{ name: 'legalDocuments', maxCount: 5 },
	{ name: 'approvalDocuments', maxCount: 5 },
])

router.route('/').get(protect, getProjects).post(protect, adminOnly, projectMediaUpload, createProject)
router.route('/:id').get(protect, getProjectById).put(protect, adminOnly, projectMediaUpload, updateProject).delete(protect, adminOnly, deleteProject)

module.exports = router

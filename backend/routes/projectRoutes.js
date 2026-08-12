const express = require('express')
const router = express.Router()
const { protect, requirePermission, blockExternalUsers } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
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

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers)

router.route('/').get(getProjects).post(requirePermission('manage_inventory'), projectMediaUpload, createProject)
router.route('/:id').get(getProjectById).put(requirePermission('manage_inventory'), projectMediaUpload, updateProject).delete(requirePermission('manage_inventory'), deleteProject)

module.exports = router

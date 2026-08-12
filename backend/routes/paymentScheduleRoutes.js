const express = require('express')
const router = express.Router()
const { protect, blockExternalUsers, requirePermission } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { getSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/paymentScheduleController')

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers, requirePermission('module:Post-Sales'))

router.route('/').get(getSchedules).post(createSchedule)
router.route('/:id').put(updateSchedule).delete(deleteSchedule)

module.exports = router

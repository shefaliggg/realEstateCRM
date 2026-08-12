const express = require('express')
const router = express.Router()
const { protect, blockExternalUsers, requirePermission } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { getPayments, createPayment, deletePayment } = require('../controllers/paymentController')

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers, requirePermission('module:Post-Sales'))

router.route('/').get(getPayments).post(createPayment)
router.route('/:id').delete(deletePayment)

module.exports = router

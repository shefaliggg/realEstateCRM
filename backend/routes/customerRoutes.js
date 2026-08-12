const express = require('express')
const router = express.Router()
const { protect, blockExternalUsers, requirePermission } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, inviteCustomer } = require('../controllers/customerController')

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers, requirePermission('module:Post-Sales'))

router.route('/').get(getCustomers).post(createCustomer)
router.route('/:id').get(getCustomerById).put(updateCustomer).delete(deleteCustomer)
router.post('/:id/invite', inviteCustomer)

module.exports = router

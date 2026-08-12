const express = require('express')
const router = express.Router()
const { protect, blockExternalUsers, requirePermission } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { getDeals, getDealById, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController')

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers, requirePermission('module:Deals'))

router.route('/').get(getDeals).post(createDeal)
router.route('/:id').get(getDealById).put(updateDeal).delete(deleteDeal)

module.exports = router

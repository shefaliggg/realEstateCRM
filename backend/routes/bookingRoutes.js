const express = require('express')
const router = express.Router()
const { protect, blockExternalUsers, requirePermission } = require('../middleware/authMiddleware')
const { attachTenantScope, requireBuilderScope } = require('../middleware/tenantMiddleware')
const { getBookings, getBookingById, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController')

router.use(protect, attachTenantScope, requireBuilderScope, blockExternalUsers, requirePermission('module:Post-Sales'))

router.route('/').get(getBookings).post(createBooking)
router.route('/:id').get(getBookingById).put(updateBooking).delete(deleteBooking)

module.exports = router

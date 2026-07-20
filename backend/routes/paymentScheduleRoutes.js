const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/paymentScheduleController')

router.route('/').get(protect, getSchedules).post(protect, createSchedule)
router.route('/:id').put(protect, updateSchedule).delete(protect, deleteSchedule)

module.exports = router

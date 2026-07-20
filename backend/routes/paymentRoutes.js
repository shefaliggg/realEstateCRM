const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getPayments, createPayment, deletePayment } = require('../controllers/paymentController')

router.route('/').get(protect, getPayments).post(protect, createPayment)
router.route('/:id').delete(protect, deletePayment)

module.exports = router

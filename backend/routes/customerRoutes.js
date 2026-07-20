const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController')

router.route('/').get(protect, getCustomers).post(protect, createCustomer)
router.route('/:id').get(protect, getCustomerById).put(protect, updateCustomer).delete(protect, deleteCustomer)

module.exports = router
